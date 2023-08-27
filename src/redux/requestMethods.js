import axios from "axios";

const BASE_URL = "http://localhost:5000/api/";

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
});

// Add an interceptor to set the Authorization header with the latest token from localStorage
userRequest.interceptors.request.use(
  (config) => {
    const persistRoot = JSON.parse(localStorage.getItem("persist:root"));
    const currentUser = persistRoot?.user && JSON.parse(persistRoot.user).currentUser;
    const TOKEN = currentUser?.accessToken || null;

    if (TOKEN) {
      config.headers.Authorization = `Bearer ${TOKEN}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
