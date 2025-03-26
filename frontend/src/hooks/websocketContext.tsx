import { createContext, useContext } from 'react';

// Define the connection status type
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

// WebSocket context
export interface WebSocketContextType {
  status: ConnectionStatus;
  sendMessage: (message: any) => void;
  lastMessage: any | null;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  status: 'disconnected',
  sendMessage: () => {},
  lastMessage: null,
});

// Hook to use the WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);
