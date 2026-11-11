import axios, { type AxiosError } from 'axios';
import type { ApiError } from '../types';
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
  (error: AxiosError<ApiError>) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    const message = error.response.data?.error ?? 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
