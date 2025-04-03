import { configureStore } from '@reduxjs/toolkit';
import mealPlanReducer from './mealPlanSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    mealPlans: mealPlanReducer,
    chats: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
