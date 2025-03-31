/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/store/chatSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatService, Chat } from '../services/chatService';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: null,
};

export const fetchChats = createAsyncThunk(
  'chats/fetchChats',
  async (orderBy: string = 'createdAt', { rejectWithValue }) => {
    try {
      return await chatService.getChats(orderBy);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChat = createAsyncThunk(
  'chats/fetchChat',
  async (chatId: string, { rejectWithValue }) => {
    try {
      return await chatService.getChat(chatId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createChat = createAsyncThunk(
  'chats/createChat',
  async (_, { rejectWithValue }) => {
    try {
      return await chatService.createChat();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chats/sendMessage',
  async (
    { chatId, message }: { chatId: string; message: string },
    { rejectWithValue }
  ) => {
    try {
      const newMessages = await chatService.sendMessage(chatId, message);
      return { chatId, newMessages };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setCurrentChat(state, action) {
      state.currentChat = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload;
      })
      .addCase(fetchChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.chats.unshift(action.payload);
        state.currentChat = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;

        // Update current chat with new messages
        if (
          state.currentChat &&
          state.currentChat._id === action.payload.chatId
        ) {
          const [userMessage, aiMessage] = action.payload.newMessages;
          state.currentChat.messages.push(userMessage, aiMessage);
        }

        // Update chat in the chats array
        const chatIndex = state.chats.findIndex(
          (chat) => chat._id === action.payload.chatId
        );
        if (chatIndex !== -1) {
          const [userMessage, aiMessage] = action.payload.newMessages;
          state.chats[chatIndex].messages.push(userMessage, aiMessage);

          // If this was the first message, update the title
          if (state.chats[chatIndex].messages.length === 2) {
            state.chats[chatIndex].title =
              state.currentChat?.title || 'New Conversation';
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentChat } = chatSlice.actions;
export default chatSlice.reducer;
