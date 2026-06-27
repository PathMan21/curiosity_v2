import axios from 'axios'
import { getAccessToken } from '../Hooks/authStore'

export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
})

export const privateApi = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api`,
  withCredentials: true,
})

privateApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('error => ', error)
    return Promise.reject(error)
  }
)
