from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from firebase_admin import auth
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            logger.info(f"User {user_id} disconnected. Remaining connections: {len(self.active_connections[user_id]) if user_id in self.active_connections else 0}")
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            logger.info(f"Sending message to user {user_id}: {message} and active connections: {self.active_connections}")
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                    logger.info(f"Message sent successfully to one connection for user {user_id}")
                except Exception as e:
                    logger.error(f"Failed to send message to connection: {str(e)}")
        else:
            logger.warning(f"No active connections found for user {user_id} and active connections: {list(self.active_connections.keys())}")
            logger.debug(f"Active connections: {list(self.active_connections.keys())}")

# Create the connection manager instance
manager = ConnectionManager()

@router.websocket("/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, token: str = None):
    try:
        # Log incoming connection attempt
        logger.info(f"WebSocket connection attempt for user_id: {user_id}")
        
        # Check if token is provided
        if not token:
            logger.error(f"No token provided for user_id: {user_id}")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # Verify the token
        try:
            decoded_token = auth.verify_id_token(token)
            token_uid = decoded_token['uid']
            
            # Verify that token UID matches the requested user_id
            if token_uid != user_id:
                logger.error(f"Token UID ({token_uid}) doesn't match requested user_id ({user_id})")
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
                
            logger.info(f"Token successfully verified for user: {user_id}")
        except Exception as e:
            logger.error(f"Token verification failed for user_id {user_id}: {str(e)}")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # Accept the connection if validation passes
        await manager.connect(websocket, user_id)
        
        # Notify the client that connection is successful
        await websocket.send_json({"type": "connection_status", "status": "connected"})
        
        # Keep the connection alive
        while True:
            data = await websocket.receive_text()
            if data:
                try:
                    message = json.loads(data)
                    # Handle messages if needed
                    logger.info(f"Received message from {user_id}: {message}")
                except:
                    pass
                    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user_id: {user_id}")
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"Error in websocket connection for user_id {user_id}: {str(e)}")
        manager.disconnect(websocket, user_id)