

from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient

from app.schemas.user import UserCreate
from app.utils.security import hash_password
from app.config import settings



router = APIRouter()

# MongoDB client setup
client = AsyncIOMotorClient(settings.DATABASE_URL)
db = client[settings.DATABASE_NAME]

@router.post("/register")
async def register_user(user: UserCreate):
    # Check if user already exists
    existing_user = await db[settings.USER_COLLECTION].find_one({"email": user.email})
    if existing_user:
        return {"message": "User already exists"}

    # Create new user
    hashed_password = hash_password(user.password)
    new_user = {
        "email": user.email,
        "password": hashed_password,
        "googleAuth": user.googleAuth,
        "firebaseUid": user.uuid
    }
    await db[settings.USER_COLLECTION].insert_one(new_user)
    return {"message": "User created successfully"}