import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  orderBurgerApi,
  getOrdersApi,
  getOrderByNumberApi
} from '../../utils/burger-api';
import { clearConstructor } from './constructorSlice';
import { TOrder } from '../../utils/types';

type TOrderState = {
  orderData: TOrder | null;
  orderRequest: boolean;
  userOrders: TOrder[];
  isLoadingOrders: boolean;
  orderByNumber: TOrder | null;
  error: string | null | undefined;
};

const initialState: TOrderState = {
  orderData: null,
  orderRequest: false,
  userOrders: [],
  isLoadingOrders: false,
  orderByNumber: null,
  error: null
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (ingredientIds: string[], { dispatch }) => {
    const data = await orderBurgerApi(ingredientIds);
    dispatch(clearConstructor());

    return {
      ...data.order,
      _id: data.order._id || '',
      status: data.order.status || 'done',
      name: data.order.name || 'Stellar Burger',
      createdAt: data.order.createdAt || new Date().toISOString(),
      updatedAt: data.order.updatedAt || new Date().toISOString(),
      ingredients: ingredientIds
    } as TOrder;
  }
);

export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async () => {
    const data = await getOrdersApi();
    return data;
  }
);

export const fetchOrderByNumber = createAsyncThunk(
  'order/fetchOrderByNumber',
  async (number: number) => {
    const data = await getOrderByNumberApi(number);
    return data.orders && data.orders.length > 0 ? data.orders[0] : null;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderData: (state) => {
      state.orderData = null;
    },
    clearOrderByNumber: (state) => {
      state.orderByNumber = null;
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
      })
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.orderByNumber = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.error = action.error.message;
      });
  }
});

export const { clearOrderData, clearOrderByNumber } = orderSlice.actions;

export const getOrderState = (state: { order: TOrderState }) => state.order;

export default orderSlice.reducer;
