import axios, { AxiosError, AxiosInstance } from "axios";


const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api", 
  headers: {
    "Content-Type": "application/json",
  }
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    Promise.reject(error)
  }
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — cần đăng nhập lại");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
