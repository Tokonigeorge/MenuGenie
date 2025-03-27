import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebaseConfig';
import { useDispatch } from 'react-redux';
import { WebSocketContext, ConnectionStatus } from '../hooks/websocketContext';
import { useLocation } from 'react-router-dom';
import { updateMealPlan } from '../store/mealPlanSlice';

// The WebSocket Provider component
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const location = useLocation();
  const dispatch = useDispatch();

  const connectWebSocket = useCallback(async () => {
    if (location.pathname !== '/') {
      return;
    }
    if (status === 'connecting' || status === 'connected') {
      console.log('WebSocket connection already in progress or established');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('User not authenticated');
        setStatus('disconnected');
        return;
      }

      // Prevent multiple WebSocket connections
      if (socket && socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      }

      const token = await user.getIdToken();
      const uid = user.uid;

      setStatus('connecting');

      const ws = new WebSocket(
        `ws://localhost:8000/api/v1/ws/${uid}?token=${encodeURIComponent(
          token
        )}`
      );

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.error('WebSocket connection timeout');
          ws.close();
        }
      }, 10000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket Connected Successfully');
        setStatus('connected');
        setReconnectAttempts(0);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          setLastMessage(data);

          if (data.type === 'meal_plan_completed' && data.meal_plan_data) {
            dispatch(updateMealPlan(data.meal_plan_data));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(
          `WebSocket Disconnected with code ${event.code}`,
          event.reason
        );
        setStatus('disconnected');
        setSocket(null);

        // Reconnect only if attempts are within limit
        if (
          document.hasFocus() &&
          reconnectAttempts < maxReconnectAttempts &&
          auth.currentUser
        ) {
          const delay = Math.min(
            3000 * Math.pow(1.5, reconnectAttempts),
            30000
          );
          console.log(
            `Reconnecting in ${delay / 1000} seconds (attempt ${
              reconnectAttempts + 1
            }/${maxReconnectAttempts})`
          );

          setTimeout(() => {
            if (auth.currentUser) {
              setReconnectAttempts((prev) => prev + 1);
              connectWebSocket();
            }
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.log('Max reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      setStatus('disconnected');
    }
  }, [status, reconnectAttempts, location.pathname]);

  // Function to send messages through the WebSocket
  const sendMessage = useCallback(
    (message: any) => {
      if (socket && status === 'connected') {
        socket.send(JSON.stringify(message));
      } else {
        console.error('Cannot send message, WebSocket not connected');
      }
    },
    [socket, status]
  );

  // Effect to handle authentication changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        connectWebSocket();
      } else {
        if (socket) {
          socket.close();
        }
        setStatus('disconnected');
      }
    });

    return () => {
      unsubscribe();
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Effect to handle reconnection on network status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network is online, reconnecting WebSocket');
      if (status !== 'connected' && auth.currentUser) {
        connectWebSocket();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [connectWebSocket, status]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && location.pathname === '/') {
        connectWebSocket();
      } else {
        if (socket) {
          socket.close();
        }
        setStatus('disconnected');
      }
    });

    return () => {
      unsubscribe();
      if (socket) {
        socket.close();
      }
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network is online, reconnecting WebSocket');
      if (
        status !== 'connected' &&
        auth.currentUser &&
        location.pathname === '/'
      ) {
        connectWebSocket();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [connectWebSocket, status, location.pathname]);

  return (
    <WebSocketContext.Provider value={{ status, sendMessage, lastMessage }}>
      {children}
      <ConnectionStatusIndicator status={status} />
    </WebSocketContext.Provider>
  );
};

// Connection status indicator component for the bottom right corner
const ConnectionStatusIndicator: React.FC<{ status: ConnectionStatus }> = ({
  status,
}) => {
  return (
    <div className='fixed bottom-4 right-4 z-50 flex items-center space-x-2 bg-white px-3 py-2 rounded-full shadow-md'>
      <div
        className={`w-3 h-3 rounded-full ${
          status === 'connected'
            ? 'bg-green-500'
            : status === 'connecting'
            ? 'bg-yellow-500'
            : 'bg-red-500'
        }`}
      />
      <span className='text-xs font-medium text-gray-700'>
        {status === 'connected'
          ? 'Connected'
          : status === 'connecting'
          ? 'Connecting...'
          : 'Disconnected'}
      </span>
    </div>
  );
};
