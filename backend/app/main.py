
from fastapi import FastAPI
from slowapi import Limiter

from slowapi.util import get_remote_address
from .routers.auth import router



limiter = Limiter(key_func=get_remote_address)

app = FastAPI()

# client = AsyncIOMotorClient(settings.DATABASE_URL)
# db = client[settings.DATABASE_NAME]


app.include_router(router)

@app.get("/")
@limiter.limit("5/minute") 


async def root():
    return {"message": "Hello from FastAPI!"}