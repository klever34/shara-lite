import {IStorageService} from './StorageService';
import {requester} from './ApiService';

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
  }): Promise<ApiResponse>;

  logIn(payload: {mobile: string; password: string}): Promise<ApiResponse>;

  logOut(): void;
}

class AuthService implements IAuthService {
  private user: User | null = null;
  private token: string | null = null;

  constructor(private storageService: IStorageService) {}

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
      return await requester.post('/signup', payload);
    } catch (error) {
      throw error;
    }
  }

  public async logIn(payload: {mobile: string; password: string}) {
    try {
      const fetchResponse = await requester.post('/login', payload);
      const {
        data: {
          credentials: {token},
          user,
        },
      } = fetchResponse;
      await this.storageService.setItem('token', token);
      this.token = token;
      await this.storageService.setItem('user', user);
      this.user = user;
      return fetchResponse;
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
