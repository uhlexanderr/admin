import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    users: [], // Initialize the users field with an empty array
    isFetching: false,
    error: false,
  },
  reducers: {
    loginStart: (state) => {
      state.isFetching = true;
    },
    loginSuccess: (state, action) => {
      state.isFetching = false;
      state.currentUser = action.payload;
    },
    loginFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    getUsersStart: (state) => {
      state.isFetching = true;
    },
    getUsersSuccess: (state, action) => {
      state.isFetching = false;
      state.users = action.payload; // Set the fetched users in the state
    },
    getUsersFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    updateUserStart: (state) => {
      state.isFetching = true;
    },
    updateUserSuccess: (state, action) => {
      state.isFetching = false;
      const updatedUserIndex = state.users.findIndex(
        (user) => user._id === action.payload.id
      );      
      if (updatedUserIndex !== -1) {
        const updatedUsers = [
          ...state.users.slice(0, updatedUserIndex),
          action.payload.user,
          ...state.users.slice(updatedUserIndex + 1)
        ];
        state.users = updatedUsers;
      }
    },
    
    updateUserFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    deleteUserStart: (state) => {
      state.isFetching = true;
    },
    deleteUserSuccess: (state, action) => {
      state.isFetching = false;
      // Remove the deleted user from the state
      state.users = state.users.filter((user) => user.id !== action.payload.userId);
    },
    deleteUserFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    logout: (state) => {
      state.currentUser = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  getUsersStart,
  getUsersSuccess,
  getUsersFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
