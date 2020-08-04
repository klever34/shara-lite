import {IStorageService} from '../storage';
import {IPubNubService} from '../pubnub';
import {INavigationService} from '../navigation';

export interface IAuthService {
  initialize(): Promise<void>;

  getUser(): User | null;

  setUser(user: User): void;

  getToken(): string | null;

  setToken(token: string): void;

  isLoggedIn(): boolean;

  logOut(): void;
}

export class AuthService implements IAuthService {
  private user: User | null = null;
  private token: string | null = null;

  constructor(
    private storageService: IStorageService,
    private pubNubService: IPubNubService,
    private navigationService: INavigationService,
  ) {}

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
    } catch (e) {
      throw e;
    }
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

  public async logOut() {
    try {
      if (this.isLoggedIn()) {
        this.user = null;
        this.token = null;
        await this.storageService.clear();
        this.pubNubService.getInstance()?.unsubscribeAll();
        this.navigationService.goToAuth();
      }
    } catch (e) {
      throw e;
    }
  }
}
