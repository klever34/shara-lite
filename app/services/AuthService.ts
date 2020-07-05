import {IStorageService} from './StorageService';
import Config from 'react-native-config';

export interface IAuthService {
  initialize(): Promise<void>;

  getUser(): User | null;

  setUser(user: User): void;

  getToken(): string | null;

  setToken(token: string): void;

  isLoggedIn(): boolean;

  register(payload: {
    firstname: string;
    lastname: string;
    country_code: string;
    mobile: string;
    password: string;
  }): Promise<Response>;

  logIn(payload: {mobile: string; password: string}): Promise<Response>;

  logOut(): void;
}

class AuthService implements IAuthService {
  private user: User | null = null;
  private token: string | null = null;

  constructor(public storageService: IStorageService) {}

  public async initialize(): Promise<void> {
    try {
      const [user, token] = await Promise.all([
        this.storageService.getItem<User>('user'),
        this.storageService.getItem<string>('token'),
      ]);
      if (user && token) {
        this.setUser(user);
        this.setToken(token);
      }
    } catch (e) {}
  }

  public getUser(): User | null {
    return this.user;
  }

  public setUser(user: User) {
    this.user = user;
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public isLoggedIn(): boolean {
    return !!this.token && !!this.user;
  }

  public async register(payload: {
    firstname: string;
    lastname: string;
    mobile: string;
    password: string;
  }) {
    try {
      const fetchResponse = await fetch(`${Config.API_BASE_URL}/signup`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {'Content-Type': 'application/json'},
      });
      const response = await fetchResponse.json();
      if (fetchResponse.ok) {
        return response;
      } else {
        throw new Error(response.mesage || response.message);
      }
    } catch (error) {
      throw error;
    }
  }

  public async logIn(payload: {mobile: string; password: string}) {
    try {
      const fetchResponse = await fetch(`${Config.API_BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {'Content-Type': 'application/json'},
      });
      const response = await fetchResponse.json();
      if (fetchResponse.ok) {
        const {
          data: {
            credentials: {token},
            user,
          },
        } = response;
        await this.storageService.setItem('token', token);
        this.token = token;
        await this.storageService.setItem('user', user);
        this.user = user;
        return response;
      } else {
        throw new Error(response.mesage || response.message);
      }
    } catch (error) {
      throw error;
    }
  }

  public async logOut() {
    this.user = null;
    this.token = null;
    await this.storageService.clear();
  }
}

export default AuthService;
