import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderBurgerApi, getOrdersApi } from '../../utils/burger-api';
import { clearConstructor } from './constructorSlice';
import { TOrder } from '../../utils/types';

type TOrderState = {
  orderData: any | null;
  orderRequest: boolean;
  userOrders: TOrder[];
  isLoadingOrders: boolean;
  error: string | null | undefined;
};

const initialState: TOrderState = {
  orderData: null,
  orderRequest: false,
  userOrders: [],
  isLoadingOrders: false,
  error: null
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (ingredientIds: string[], { dispatch }) => {
    const data = await orderBurgerApi(ingredientIds);
    dispatch(clearConstructor());
    return data.order;
  }
);

export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async () => {
    const data = await getOrdersApi();
    return data;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderData: (state) => {
      state.orderData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoadingOrders = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoadingOrders = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoadingOrders = false;
        state.error = action.error.message;
      });
  }
});

export const { clearOrderData } = orderSlice.actions;

export const getOrderState = (state: { order: TOrderState }) => state.order;

export default orderSlice.reducer;
