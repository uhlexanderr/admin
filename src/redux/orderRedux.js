import { createSlice } from "@reduxjs/toolkit";

export const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    isFetching: false,
    error: false,
  },
  reducers: {
    // GET ALL ORDERS
    getOrderStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    getOrderSuccess: (state, action) => {
      state.isFetching = false;
      state.orders = action.payload;
    },
    getOrderFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    // DELETE ORDER
    deleteOrderStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    deleteOrderSuccess: (state, action) => {
      state.isFetching = false;
      state.orders = state.orders.filter(
        (order) => order._id !== action.payload
      );
    },
    deleteOrderFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    // UPDATE ORDER
    updateOrderStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    updateOrderSuccess: (state, action) => {
      state.isFetching = false;
      const updatedOrderIndex = state.orders.findIndex(
        (order) => order._id === action.payload.id
      );
      if (updatedOrderIndex !== -1) {
        state.orders[updatedOrderIndex] = action.payload.order;
      }
    },
    updateOrderFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    // ADD ORDER
    addOrderStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    addOrderSuccess: (state, action) => {
      state.isFetching = false;
      state.orders.push(action.payload);
    },
    addOrderFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
  getOrderStart,
  getOrderSuccess,
  getOrderFailure,
  deleteOrderStart,
  deleteOrderSuccess,
  deleteOrderFailure,
  updateOrderStart,
  updateOrderSuccess,
  updateOrderFailure,
  addOrderStart,
  addOrderSuccess,
  addOrderFailure,
} = orderSlice.actions;

export default orderSlice.reducer;
