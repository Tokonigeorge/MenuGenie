
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
import firebase_admin
from firebase_admin import credentials
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from .routers.auth import router as auth_router
from .routers.meal_plan import router as meal_plan_router
from .routers.chat import router as chat_router
from .utils.websocket import router as websocket_router

# Add WebSocket connection manager


limiter = Limiter(key_func=get_remote_address)

app = FastAPI()

#CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
# client = AsyncIOMotorClient(settings.DATABASE_URL)
# db = client[settings.DATABASE_NAME]

cred = credentials.Certificate("app/firebase-cred.json")
firebase_admin.initialize_app(cred)


app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(meal_plan_router, prefix="/api/v1/meal-plans", tags=["meal-plans"])
app.include_router(websocket_router, prefix="/api/v1/ws", tags=["websocket"])
app.include_router(chat_router, prefix="/api/v1/chats", tags=["chats"])

@app.get("/")
@limiter.limit("7/minute") 




async def root(request: Request):
    return {"message": "Hello from FastAPI!"}

