from datetime import datetime
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from firebase_admin import auth as firebase_auth
from firebase_admin.exceptions import FirebaseError
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from app.config import settings

# Set up security scheme
security = HTTPBearer()

# MongoDB client setup
client = AsyncIOMotorClient(settings.DATABASE_URL)
db = client[settings.DATABASE_NAME]

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify Firebase token and get current user
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    try:
        # Verify the Firebase token
        decoded_token = firebase_auth.verify_id_token(token)
        
        # Get user ID (Firebase UID)
        user_uid = decoded_token.get("uid")
        if not user_uid:
            raise credentials_exception
            
        # Find user in our MongoDB database using Firebase UID
        user = await db[settings.USER_COLLECTION].find_one({"firebaseUid": user_uid})
        
        # If user doesn't exist in our DB but is authenticated with Firebase,
        # we can create a new user record
        if not user:
            email = decoded_token.get("email")
            if not email:
                raise credentials_exception
                
            # Create a new user in our database
            new_user = {
                "email": email,
                "firebaseUid": user_uid,
                "createdAt": datetime.now().isoformat()
            }
            
            result = await db[settings.USER_COLLECTION].insert_one(new_user)
            user = await db[settings.USER_COLLECTION].find_one({"_id": result.inserted_id})
            
        return user
        
    except (JWTError, FirebaseError) as e:
        print(f"Authentication error: {str(e)}")
        raise credentials_exception from e