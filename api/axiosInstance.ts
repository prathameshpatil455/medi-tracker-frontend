import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// API Configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    // const token =
    //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NTJjM2M4OGI5MmM2NmQ5YTExMGUyNiIsImlhdCI6MTc1MDQ0NDYxOCwiZXhwIjoxNzUzMDM2NjE4fQ.I062JJ-8fp4iCJBvuOvVmK6PleFCo1MYL1DTkyL6m-k";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.log("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.log("API Response Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });

    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token and redirect to login
      await AsyncStorage.removeItem("token");
      // You might want to add navigation logic here
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
