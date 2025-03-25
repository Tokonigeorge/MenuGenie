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

settings = Settings()