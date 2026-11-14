
import axios, { type AxiosError } from 'axios';
import { storageUtils } from '../utils/storageUtils';

const axiosClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
axiosClient.interceptors.request.use((config) => {
  const token = storageUtils.loadToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: normalize errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new Error('Request timed out. Please try again.')
      );
    }

    if (!error.response) {
      return Promise.reject(
        new Error('Network error. Please check your connection.')
      );
    }

    const data = error.response.data;
    let message = 'An unexpected error occurred.';

    if (typeof data === 'string') {
      message = data;
    } else if (data && typeof data === 'object') {
      const payload = data as Record<string, unknown>;
      const rawError = payload.error ?? payload.message;

      if (typeof rawError === 'string') {
        message = rawError;
      } else if (
        rawError &&
        typeof rawError === 'object' &&
        'message' in rawError &&
        typeof rawError.message === 'string'
      ) {
        message = rawError.message;
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;

