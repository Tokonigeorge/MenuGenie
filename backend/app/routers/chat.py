# backend/app/routers/chat.py
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Optional, Any
from datetime import datetime
from bson import ObjectId
import openai
from pydantic import BaseModel
from app.schemas.chat import ChatMessage, GenieChat, MessageRequest, MealMessageRequest
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
async def get_chats(user_id: str = Depends(get_current_user), order_by: str = 'createdAt'):
    # Extract just the user ID if a full user object is returned    
    user_id_str = user_id["_id"] if isinstance(user_id, dict) and "_id" in user_id else user_id
    
    # Convert to string if it's an ObjectId
    if isinstance(user_id_str, ObjectId):
        user_id_str = str(user_id_str)

    sort_field = order_by if order_by in ["createdAt", "updatedAt"] else "createdAt"
    chats = await db[settings.CHAT_COLLECTION].find({"userId": user_id_str}).sort(sort_field, -1).to_list(100)
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
    is_first_message = len(chat["messages"]) == 0
    response_data = await generate_ai_response(chat["messages"] + [user_message], is_first_message)
    

    if is_first_message:
        ai_response = response_data["content"]
        new_title = response_data["title"]
    else:
        ai_response = response_data
        new_title = chat["title"]
    
    ai_message = {
        "content": ai_response,
        "isUser": False,
        "timestamp": datetime.now().isoformat()
    }
    
    new_messages = chat["messages"] + [user_message, ai_message]
    update_data = {
        "messages": new_messages,
        "updatedAt": datetime.now().isoformat()
    }

    if new_title:
        update_data["title"] = new_title
    
    await db[settings.CHAT_COLLECTION].update_one(
        {"_id": ObjectId(chat_id)},
        {"$set": update_data}
    )
    
    return [user_message, ai_message]

# Helper function to generate AI response with context
async def generate_ai_response(messages, generate_title=False):
    # Format messages for OpenAI
    openai_messages = [{"role": "system", "content": "You are a helpful nutritionist and cooking expert named Genie. Answer questions about food, cooking, nutrition, and meal planning. Be concise but thorough, when neccesary give things in a list format. Be very specific and detailed. Be very friendly, engaging and helpful."}]
    if generate_title:
        openai_messages += "Additionally, at the end of your response, include a line '<TITLE:Your suggested title>' where you provide a concise title (max 5 words) for this conversation based on the user's initial message."
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

    response_content = response.choices[0].message.content

    if generate_title:
        # Split the response to separate content and title
        if "<TITLE:" in response_content:
            parts = response_content.split("<TITLE:")
            content = parts[0].strip()
            title = parts[1].strip().rstrip('>')[:50]  # Extract title and limit to 50 chars
        else:
            # Fallback if the AI didn't follow the format
            content = response_content
            title = "New Conversation"
        return {"content": content, "title": title}
    
    return response_content


# Add meal-specific message endpoint
@router.post("/meal-chat", response_model=List[ChatMessage])
async def add_meal_message(message_request: MealMessageRequest, user_id: str = Depends(get_current_user)):
    # Extract user ID
    user_id_str = user_id["_id"] if isinstance(user_id, dict) and "_id" in user_id else user_id
    
    # Convert to string if it's an ObjectId
    if isinstance(user_id_str, ObjectId):
        user_id_str = str(user_id_str)
    
    # Find or create a meal-specific chat
    chat_title = f"Meal Chat: {message_request.mealType} - Day {message_request.dayId}"
    query = {
        "userId": user_id_str,
        "mealPlanId": message_request.mealPlanId,
        "dayId": message_request.dayId,
        "mealType": message_request.mealType
    }
     # Find existing chat or create new one
    chat = await db[settings.MEAL_CHAT_COLLECTION].find_one(query)
    
    if not chat:
        # Create new chat for this meal
        new_chat = {
            **query,
            "title": chat_title,
            "messages": [],
            "isMealChat": True,
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        result = await db[settings.MEAL_CHAT_COLLECTION].insert_one(new_chat)
        chat = await db[settings.MEAL_CHAT_COLLECTION].find_one({"_id": result.inserted_id})
    
    # Add user message
    user_message = {
        "content": message_request.message,
        "isUser": True,
        "timestamp": datetime.now().isoformat()
    }
    
    # Generate AI response with meal context
    is_first_message = len(chat["messages"]) == 0

    meal_plan = await db[settings.MEAL_PLAN_COLLECTION].find_one({"_id": ObjectId(message_request.mealPlanId)})
    meal_context = "No meal details available"
    
    if meal_plan and "mealPlan" in meal_plan and "days" in meal_plan["mealPlan"]:
        for day in meal_plan["mealPlan"]["days"]:
            if str(day["day"]) == message_request.dayId:
                for meal in day["meals"]:
                    if meal["type"] == message_request.mealType:
                        meal_context = f"Meal: {meal['name']}\nIngredients: {', '.join(meal['ingredients'])}\nDescription: {meal.get('description', 'No description')}"
                        break
    response_data = await generate_meal_ai_response(chat["messages"] + [user_message], meal_context, is_first_message)
    if is_first_message:
        ai_response = response_data["content"]
        new_title = response_data["title"]
    else:
        ai_response = response_data
        new_title = chat["title"]
    
    ai_message = {
        "content": ai_response,
        "isUser": False,
        "timestamp": datetime.now().isoformat()
    }
    
    new_messages = chat["messages"] + [user_message, ai_message]
    update_data = {
        "messages": new_messages,
        "updatedAt": datetime.now().isoformat()
    }

    if new_title and is_first_message:
        update_data["title"] = new_title
    
    await db[settings.CHAT_COLLECTION].update_one(
        {"_id": chat["_id"]},
        {"$set": update_data}
    )
    
    return [user_message, ai_message]

# Get meal-specific chat history
@router.get("/meal-chat/{meal_plan_id}/{day_id}/{meal_type}", response_model=GenieChat)
async def get_meal_chat_history(
    meal_plan_id: str, 
    day_id: str, 
    meal_type: str, 
    user_id: str = Depends(get_current_user)
):
    # Extract user ID
    user_id_str = user_id["_id"] if isinstance(user_id, dict) and "_id" in user_id else user_id
    
    # Convert to string if it's an ObjectId
    if isinstance(user_id_str, ObjectId):
        user_id_str = str(user_id_str)
    
    # Find existing chat
    query = {
        "userId": user_id_str,
        "mealPlanId": meal_plan_id,
        "dayId": day_id,
        "mealType": meal_type
    }
    
    chat = await db[settings.MEAL_CHAT_COLLECTION].find_one(query)
    
    if not chat:
        # Return empty chat if none exists
        return {
            "title": f"Meal Chat: {meal_type} - Day {day_id}",
            "messages": [],
            "isMealChat": True,
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
    
    # Convert ObjectId to string
    if "_id" in chat:
        chat["_id"] = str(chat["_id"])
    
    return chat

# Add this new endpoint after the other chat endpoints
@router.delete("/{chat_id}")
async def delete_chat(chat_id: str, user_id: str = Depends(get_current_user)):
    # Extract just the user ID if a full user object is returned    
    user_id_str = user_id["_id"] if isinstance(user_id, dict) and "_id" in user_id else user_id
    
    # Convert to string if it's an ObjectId
    if isinstance(user_id_str, ObjectId):
        user_id_str = str(user_id_str)
        
    # First check if the chat exists and belongs to the user
    chat = await db[settings.CHAT_COLLECTION].find_one({
        "_id": ObjectId(chat_id),
        "userId": user_id_str
    })
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Delete the chat
    result = await db[settings.CHAT_COLLECTION].delete_one({
        "_id": ObjectId(chat_id),
        "userId": user_id_str
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Failed to delete chat")
    
    return {"message": "Chat deleted successfully"}

async def generate_meal_ai_response(messages, meal_context, generate_title=False):
    # Format messages for OpenAI with meal context
    system_prompt = """You are a helpful nutritionist and cooking expert named Genie. 
    Answer questions about the specific meal details provided below. 
    Be concise but thorough, when necessary give things in a list format. 
    Be very specific and detailed. Be very friendly, engaging and helpful.
    
    MEAL DETAILS:
    """
    
    system_prompt += meal_context
    
    openai_messages = [{"role": "system", "content": system_prompt}]
    
    if generate_title:
        title_instruction = "Additionally, at the end of your response, include a line '<TITLE:Your suggested title>' where you provide a concise title (max 5 words) for this conversation based on the user's initial message."
        openai_messages[0]["content"] += "\n\n" + title_instruction
    
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

    response_content = response.choices[0].message.content

    if generate_title:
        # Split the response to separate content and title
        if "<TITLE:" in response_content:
            parts = response_content.split("<TITLE:")
            content = parts[0].strip()
            title = parts[1].strip().rstrip('>')[:50]  # Extract title and limit to 50 chars
        else:
            # Fallback if the AI didn't follow the format
            content = response_content
            title = "Meal Question"
        return {"content": content, "title": title}
    
    return response_content