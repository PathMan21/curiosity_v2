import axios from 'axios'
import { getAccessToken } from '../Hooks/authStore'

const API_BASE_URL = process.env.VITE_SERVER_URL || ''

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
})

export const privateApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
