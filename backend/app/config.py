import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_USERNAME = os.getenv("MONGODB_USERNAME")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
MONGODB_CLUSTER = os.getenv("MONGODB_CLUSTER")

if not all([MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_CLUSTER]):
    raise ValueError("Missing required MongoDB environment variables.")

MONGO_URI = f"mongodb+srv://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@{MONGODB_CLUSTER}/?retryWrites=true&w=majority&appName=metadata&tls=true"
class Settings:
    DATABASE_URL: str = MONGO_URI
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME") or "genie"
    USER_COLLECTION: str = os.getenv("USER_COLLECTION") or "users"
    MEAL_PLAN_COLLECTION: str = os.getenv("MEAL_PLAN_COLLECTION") or "meal_plans"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    CHAT_COLLECTION: str = os.getenv("CHAT_COLLECTION") or "chats"
    MEAL_CHAT_COLLECTION: str = os.getenv("MEAL_CHAT_COLLECTION") or "meal_chats"
settings = Settings()