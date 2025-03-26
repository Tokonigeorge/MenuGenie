from pydantic import BaseModel, EmailStr
from typing import Optional
class UserCreate(BaseModel):
    email: EmailStr
    password: Optional[str] = None
    googleAuth: Optional[bool] = False
    firebaseUid: Optional[str] = None