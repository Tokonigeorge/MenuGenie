// frontend/src/services/chatService.ts
import axios from 'axios';
import { auth } from '../firebaseConfig';

//todo: change to backend url and add to .env
const API_URL = 'http://localhost:8000/api/v1';

export interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: string;
}

export interface Chat {
  _id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export const chatService = {
  async getChats(orderBy: string = 'createdAt'): Promise<Chat[]> {
    const user = await auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const token = await user.getIdToken();
    const response = await axios.get(`${API_URL}/chats?orderBy=${orderBy}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  async getChat(chatId: string): Promise<Chat> {
    const user = await auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const token = await user.getIdToken();
    const response = await axios.get(`${API_URL}/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  async deleteChat(chatId: string): Promise<void> {
    const user = await auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const token = await user.getIdToken();
    await axios.delete(`${API_URL}/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async createChat(): Promise<Chat> {
    const user = await auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const token = await user.getIdToken();
    const response = await axios.post(
      `${API_URL}/chats`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },

  async sendMessage(chatId: string, message: string): Promise<ChatMessage[]> {
    const user = await auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const token = await user.getIdToken();
    const response = await axios.post(
      `${API_URL}/chats/${chatId}/messages`,
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },
};
