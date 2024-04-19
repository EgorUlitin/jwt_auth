import axios from 'axios';
import { AuthResponse } from '../models/response/AuthRespons';

export const API_URL = 'http://localhost:7777/api';
export const ACCESS_TOKEN_LOCAL_STORAGE_KEY = 'token';

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
  if (config.headers) {
    config.headers.Authorization = `Bearer ${
      localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY) || ''
    }`;
  }
  return config;
});

$api.interceptors.request.use(
  (config) => {
    return config;
  },
  async (error) => {
    const originalConfig = error.config;
    if (
      error.response.status == 401 &&
      error.config &&
      !error.config._isRetry
    ) {
      originalConfig._isRetry = true;
      try {
        const {
          data: { accessToken },
        } = await axios.get<AuthResponse>(`${API_URL}/refresh`, {
          withCredentials: true,
        });
        localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, accessToken);
        return $api.request(originalConfig);
      } catch (error) {
        console.log('НЕ АВТОРИЗОВАН');
      }
    }
    throw error;
  },
);

export default $api;
