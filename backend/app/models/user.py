from pydantic import BaseModel
from bson import ObjectId

class User(BaseModel):
    id: str
    email: str
    password: str

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }