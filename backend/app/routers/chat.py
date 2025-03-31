# backend/app/routers/chat.py
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Optional, Any
from datetime import datetime
from bson import ObjectId
import openai
from pydantic import BaseModel
from app.schemas.chat import ChatMessage, GenieChat
from app.config import settings
from app.utils.auth import get_current_user

router = APIRouter()

client = AsyncIOMotorClient(settings.DATABASE_URL)
db = client[settings.DATABASE_NAME]

openai_client = None
if settings.OPENAI_API_KEY:
    openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
else:
    print("WARNING: OPENAI_API_KEY not set. OpenAI features will not be available.")

# Create new chat
@router.post("/", response_model=GenieChat)
async def create_chat(user_id: str = Depends(get_current_user)):
    # Extract just the user ID if a full user object is returned
    user_id_str = user_id["_id"] if isinstance(user_id, dict) and "_id" in user_id else user_id
    
    # Convert to string if it's an ObjectId
    if isinstance(user_id_str, ObjectId):
        user_id_str = str(user_id_str)

    new_chat = {
        "userId": user_id_str,
        "title": "New Conversation",
        "messages": [],
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    result = await db[settings.CHAT_COLLECTION].insert_one(new_chat)
    created_chat = await db[settings.CHAT_COLLECTION].find_one({"_id": result.inserted_id})
        # Ensure _id is properly converted to string for response
    created_chat["_id"] = str(created_chat["_id"])
    return created_chat

# Get all chats for a user
@router.get("/", response_model=List[GenieChat])
async def get_chats(user_id: str = Depends(get_current_user)):
    # Extract just the user ID if a full user object is returned    
    user_id_str = user_id["_id"] if isinstance(user_id, dict) and "_id" in user_id else user_id
    
    # Convert to string if it's an ObjectId
    if isinstance(user_id_str, ObjectId):
        user_id_str = str(user_id_str)
    
    chats = await db[settings.CHAT_COLLECTION].find({"userId": user_id_str}).to_list(100)
    # Ensure all _id fields are converted to strings
    for chat in chats:
        chat["_id"] = str(chat["_id"])
    return chats

# Get specific chat by ID
@router.get("/{chat_id}", response_model=GenieChat)
async def get_chat(chat_id: str, user_id: str = Depends(get_current_user)):
    # Extract just the user ID if a full user object is returned    
    user_id_str = user_id["_id"] if isinstance(user_id, dict) and "_id" in user_id else user_id
    
    # Convert to string if it's an ObjectId
    if isinstance(user_id_str, ObjectId):
        user_id_str = str(user_id_str)
        
    chat = await db[settings.CHAT_COLLECTION].find_one({"_id": ObjectId(chat_id), "userId": user_id_str})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


class MessageRequest(BaseModel):
    message: str
# Add message to chat and get AI response
@router.post("/{chat_id}/messages", response_model=List[ChatMessage])
async def add_message(chat_id: str, message_request: MessageRequest, user_id: str = Depends(get_current_user)):
    # Extract just the user ID if a full user object is returned    
    user_id_str = user_id["_id"] if isinstance(user_id, dict) and "_id" in user_id else user_id
    
    # Convert to string if it's an ObjectId
    if isinstance(user_id_str, ObjectId):
        user_id_str = str(user_id_str)
        
    chat = await db[settings.CHAT_COLLECTION].find_one({"_id": ObjectId(chat_id), "userId": user_id_str})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    user_message = {
        "content": message_request.message,
        "isUser": True,
        "timestamp": datetime.now().isoformat()
    }
    
    ai_response = await generate_ai_response(chat["messages"] + [user_message])
    
    ai_message = {
        "content": ai_response,
        "isUser": False,
        "timestamp": datetime.now().isoformat()
    }
    
    new_messages = chat["messages"] + [user_message, ai_message]
    
    if len(chat["messages"]) == 0:
        new_title = await generate_chat_title(message_request.message)
        await db[settings.CHAT_COLLECTION].update_one(
            {"_id": ObjectId(chat_id)},
            {
                "$set": {
                    "messages": new_messages,
                    "title": new_title,
                    "updatedAt": datetime.now().isoformat()
                }
            }
        )
    else:
        await db[settings.CHAT_COLLECTION].update_one(
            {"_id": ObjectId(chat_id)},
            {
                "$set": {
                    "messages": new_messages,
                    "updatedAt": datetime.now().isoformat()
                }
            }
        )
    
    return [user_message, ai_message]

# Helper function to generate AI response with context
async def generate_ai_response(messages):
    # Format messages for OpenAI
    openai_messages = [{"role": "system", "content": "You are a helpful nutritionist and cooking expert named Genie. Answer questions about food, cooking, nutrition, and meal planning. Be concise but thorough, when neccesary give things in a list format. Be very specific and detailed. Be very friendly, engaging and helpful."}]
    
    # Add conversation history
    for msg in messages:
        role = "user" if msg["isUser"] else "assistant"
        openai_messages.append({"role": role, "content": msg["content"]})
    
    # Call OpenAI
    response = await openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=openai_messages,
        temperature=0.7
    )
    
    return response.choices[0].message.content

# Generate a title based on the first message
async def generate_chat_title(message):
    response = await openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Generate a short, concise title (max 5 words) for a conversation that starts with this message:"},
            {"role": "user", "content": message}
        ],
        temperature=0.7,
        max_tokens=20
    )
    
    title = response.choices[0].message.content.strip('"')
    return title[:50] 