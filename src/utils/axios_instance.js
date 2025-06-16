import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth-admin-token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data && config.data instanceof FormData) {
      // Important: Let the browser set proper Content-Type with boundary
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
