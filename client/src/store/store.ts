import { makeAutoObservable } from 'mobx';
import { IUser } from '../models/IUser';
import AuthService from '../services/AuthService';
import { ACCESS_TOKEN_LOCAL_STORAGE_KEY, API_URL } from '../http';
import axios from 'axios';
import { AuthResponse } from '../models/response/AuthRespons';
import UserService from '../services/UserService';

export default class Store {
  user = {} as IUser;
  isAuth = false;
  isLoading = false;
  users = [] as IUser[];

  constructor() {
    makeAutoObservable(this);
  }

  setAuth(bool: boolean) {
    this.isAuth = bool;
  }

  setUser(user: IUser) {
    this.user = user;
  }

  setLoading(bool: boolean) {
    this.isLoading = bool;
  }

  async login(email: string, password: string) {
    try {
      const {
        data: { accessToken, user },
      } = await AuthService.login(email, password);

      localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, accessToken);
      this.setAuth(true);
      this.setUser(user);
    } catch (error) {
      console.log(error);
    }
  }

  async registation(email: string, password: string) {
    try {
      const {
        data: { accessToken, user },
      } = await AuthService.registration(email, password);

      localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, accessToken);
      this.setAuth(true);
      this.setUser(user);
    } catch (error) {
      console.log(error);
    }
  }

  async logout() {
    await AuthService.logout();
    this.setAuth(false);
    this.setUser({} as IUser);
    localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
  }

  async checkAuth() {
    this.setLoading(true);
    try {
      const {
        data: { accessToken, user },
      } = await axios.get<AuthResponse>(`${API_URL}/refresh`, {
        withCredentials: true,
      });
      localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, accessToken);
      this.setAuth(true);
      this.setUser(user);
    } catch (error) {
      console.log(error);
    } finally {
      this.setLoading(false);
    }
  }
}
