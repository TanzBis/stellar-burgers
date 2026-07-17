import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getIngredientsApi } from '../../utils/burger-api';
import { TIngredient } from '../../utils/types';

// 1. Описываем тип для стейта ингредиентов
type TIngredientsState = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: string | null | undefined;
};

// 2. Начальное состояние
const initialState: TIngredientsState = {
  ingredients: [],
  isLoading: false,
  error: null
};

// 3. Асинхронный Thunk для запроса данных с сервера
export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchIngredients',
  async () => {
    const data = await getIngredientsApi();
    return data;
  }
);

// 4. Создаем сам слайс
const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        // Если пришел объект с полем data, берем его, иначе берем сам payload
        state.ingredients = Array.isArray(action.payload)
          ? action.payload
          : (action.payload as any).data || [];
      })

      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  }
});

// 5. Селекторы для получения данных в компонентах
export const getIngredientsState = (state: {
  ingredients: TIngredientsState;
}) => state.ingredients;

// 6. Экспортируем редюсер
export default ingredientsSlice.reducer;
