import { AxiosResponse } from 'axios';
import $api from '../http';
import { AuthResponse } from '../models/response/AuthRespons';

export default class AuthService {
  static async login(
    email: string,
    password: string,
  ): Promise<AxiosResponse<AuthResponse>> {
    return $api.post<AuthResponse>('/login', {
      email,
      password,
    });
  }
  static async logout(): Promise<void> {
    return $api.post('/logout');
  }
  static async registration(
    email: string,
    password: string,
  ): Promise<AxiosResponse<AuthResponse>> {
    return $api.post('/registration', {
      email,
      password,
    });
  }
}
