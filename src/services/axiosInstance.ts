import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8010/api/v1/workplace-tracker-service",
});

// Add token from localStorage to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
