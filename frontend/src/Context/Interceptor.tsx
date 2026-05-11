import axios from "axios";
import { getAccessToken } from "../Hooks/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

axios.interceptors.request.use(
    
    (config) => {
          const token = getAccessToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }

);

axios.get('api/protected').then(console.log).catch(console.error);