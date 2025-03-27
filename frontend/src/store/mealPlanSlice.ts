// src/store/mealPlanSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { auth } from '../firebaseConfig';

export interface MealDay {
  day: number;
  meals: MealItem[];
}

export interface MealItem {
  type: string;
  name: string;
  ingredients: string[];
  recipe: string;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface MealPlan {
  _id: string;
  userId: string;
  firebaseUid: string;
  startDate: string;
  endDate: string;
  mealType: string[];
  dietaryPreferences: string[];
  cuisineTypes: string[];
  complexityLevels: string[];
  status: 'pending' | 'completed' | 'error';
  createdAt: string;
  completedAt?: string;
  mealPlan?: {
    days: MealDay[];
  };
  error?: string;
}

interface MealPlanState {
  mealPlans: MealPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: MealPlanState = {
  mealPlans: [],
  loading: false,
  error: null,
};

export const fetchMealPlans = createAsyncThunk(
  'mealPlans/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const user = await auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      const response = await axios.get(
        'http://localhost:8000/api/v1/meal-plans',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue('Unknown error occurred');
    }
  }
);

const mealPlanSlice = createSlice({
  name: 'mealPlans',
  initialState,
  reducers: {
    addMealPlan(state, action) {
      state.mealPlans.unshift(action.payload);
    },
    updateMealPlan(state, action) {
      const index = state.mealPlans.findIndex(
        (plan) => plan._id === action.payload._id
      );
      if (index !== -1) {
        state.mealPlans[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMealPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMealPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.mealPlans = action.payload;
      })
      .addCase(fetchMealPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addMealPlan, updateMealPlan } = mealPlanSlice.actions;
export default mealPlanSlice.reducer;
