import axiosClient from '../../api/axiosClient';
import type { User, ApiResponse, RegisterFormValues, LoginFormValues } from '../../types';

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(values: RegisterFormValues): Promise<AuthResponse> {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', values);
    return response.data.data;
  },

  async login(values: LoginFormValues): Promise<AuthResponse> {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', values);
    return response.data.data;
  },
};
