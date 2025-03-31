# backend/app/schemas/chat.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.schemas.common import PyObjectId

class ChatMessage(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    content: str
    isUser: bool
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
        "json_schema_extra": {
            "example": {
                "_id": "123456789012345678901234",
                "content": "Hello, how can I help you?",
                "isUser": False,
                "timestamp": "2023-04-01T12:00:00.000000"
            }
        }
    }

class GenieChat(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    userId: str
    title: str  
    messages: List[ChatMessage] = []
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now().isoformat())

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
        "json_schema_extra": {
            "example": {
                "_id": "123456789012345678901234",
                "userId": "user123",
                "title": "Chat Title",
                "messages": [],
                "createdAt": "2023-04-01T12:00:00.000000",
                "updatedAt": "2023-04-01T12:00:00.000000"
            }
        }
    }