import { configureStore } from '@reduxjs/toolkit';
import mealPlanReducer from './mealPlanSlice';

export const store = configureStore({
  reducer: {
    mealPlans: mealPlanReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
