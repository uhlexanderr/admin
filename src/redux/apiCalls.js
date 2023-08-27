import {
  loginFailure,
  loginStart,
  loginSuccess,
  getUsersStart,
  getUsersSuccess,
  getUsersFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
} from "./userRedux";

import { publicRequest, userRequest } from "../redux/requestMethods";
import {
  getProductFailure,
  getProductStart,
  getProductSuccess,
  deleteProductFailure,
  deleteProductStart,
  deleteProductSuccess,
  updateProductFailure,
  updateProductStart,
  updateProductSuccess,
  addProductFailure,
  addProductStart,
  addProductSuccess,
} from "./productRedux";

import {
  getOrderFailure,
  getOrderStart,
  getOrderSuccess,
  deleteOrderFailure,
  deleteOrderStart,
  deleteOrderSuccess,
  updateOrderFailure,
  updateOrderStart,
  updateOrderSuccess,
} from "./orderRedux";

export const login = async (dispatch, user) => {
  dispatch(loginStart());
  try {
    const res = await publicRequest.post("/auth/login", user);
    dispatch(loginSuccess(res.data));
    return true;
  } catch (err) {
    dispatch(loginFailure());
    return false;
  }
};

export const getProducts = async (dispatch) => {
  dispatch(getProductStart());
  try {
    const res = await publicRequest.get("/products");
    dispatch(getProductSuccess(res.data));
  } catch (err) {
    dispatch(getProductFailure());
  }
};

export const deleteProduct = async (id, dispatch) => {
  dispatch(deleteProductStart());
  try {
    await userRequest.delete(`/products/${id}`);
    dispatch(deleteProductSuccess(id));
  } catch (err) {
    dispatch(deleteProductFailure());
  }
};

export const updateProductData = async (id, product, dispatch) => {
  dispatch(updateProductStart());
  try {
    const res = await userRequest.put(`/products/${id}`, product);
    dispatch(updateProductSuccess({ id, product: res.data }));
  } catch (error) {
    dispatch(updateProductFailure());
    throw error.response;
  }
};

export const addProduct = async (product, dispatch) => {
  dispatch(addProductStart());
  try {
    const res = await userRequest.post(`/products`, product);
    dispatch(addProductSuccess(res.data));
  } catch (err) {
    dispatch(addProductFailure());
  }
};

export const getAllUsers = async (dispatch) => {
  dispatch(getUsersStart()); // Dispatch getUsersStart to set the loading state
  try {
    const users = await publicRequest.get("/users"); // Assuming you have an endpoint to fetch all users
    dispatch(getUsersSuccess(users.data)); // Dispatch getUsersSuccess with the fetched users data
    return users.data;
  } catch (err) {
    dispatch(getUsersFailure()); // Dispatch getUsersFailure in case of an error
    return [];
  }
};

export const updateUser = (userId, user) => async (dispatch) => {
  dispatch(updateUserStart());
  try {
    const res = await userRequest.put(`/users/${userId}`, user); // Change 'id' to 'userId'
    dispatch(updateUserSuccess({ id: userId, user: res.data })); // Change 'id' to 'userId'
  } catch (err) {
    dispatch(updateUserFailure());
  }
};

// New function for deleting a user
export const deleteUser = async (id, dispatch) => {
  dispatch(deleteUserStart());
  try {
    await userRequest.delete(`/users/${id}`);
    dispatch(deleteUserSuccess(id));
  } catch (err) {
    dispatch(deleteUserFailure());
  }
};

// New function for getting all orders
export const getOrders = async (dispatch) => {
  dispatch(getOrderStart());
  try {
    const res = await publicRequest.get("/orders"); // Assuming the endpoint for orders is correct
    dispatch(getOrderSuccess(res.data));
    return res.data; // Make sure the response data is returned from the function
  } catch (err) {
    dispatch(getOrderFailure());
    return []; // Return an empty array in case of an error to prevent 'undefined' return value
  }
};

export const deleteOrder = async (id, dispatch) => {
  dispatch(deleteOrderStart());
  try {
    await userRequest.delete(`/orders/${id}`); // Assuming you have an endpoint to delete an order
    dispatch(deleteOrderSuccess(id));
  } catch (err) {
    dispatch(deleteOrderFailure());
  }
};

// New function for updating an order
export const updateOrder = async (id, order, dispatch) => {
  dispatch(updateOrderStart());
  try {
    const res = await userRequest.put(`/orders/${id}`, order); // Assuming you have an endpoint to update an order
    dispatch(updateOrderSuccess({ id, order: res.data }));
  } catch (err) {
    dispatch(updateOrderFailure());
    throw err.response;
  }
};