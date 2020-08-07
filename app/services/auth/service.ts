import {IStorageService} from '../storage';
import {IPubNubService} from '../pubnub';
import {INavigationService} from '../navigation';
//@ts-ignore
import {getCurrency} from 'country-currency-map';
import {User} from '../../../types/app';

export interface IAuthService {
  initialize(): Promise<void>;

  getUser(): User | null;

  setUser(user: User): void;

  getToken(): string | null;

  setToken(token: string): void;

  getRealmJwt(): string | null;

  setRealmJwt(realmJwt: string): void;

  isLoggedIn(): boolean;

  logOut(): void;

  getUserCurrency(): string;
}

export class AuthService implements IAuthService {
  private user: User | null = null;
  private token: string | null = null;
  private realmJwt: string | null = null;

  constructor(
    private storageService: IStorageService,
    private pubNubService: IPubNubService,
    private navigationService: INavigationService,
  ) {}

  public async initialize(): Promise<void> {
    try {
      const [user, token, realmJwt] = await Promise.all([
        this.storageService.getItem<User>('user'),
        this.storageService.getItem<string>('token'),
        this.storageService.getItem<string>('realmJwt'),
      ]);
      if (user && token) {
        this.setUser(user);
        this.setToken(token);
      }
      if (realmJwt) {
        this.setRealmJwt(realmJwt);
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

  public setRealmJwt(realmJwt: string) {
    this.realmJwt = realmJwt;
  }

  public getRealmJwt(): string | null {
    return this.realmJwt;
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

  public getUserCurrency(): string {
    const user = this.user;
    const countryCurrency =
      user?.currency_code && getCurrency(user?.currency_code);
    const currency = countryCurrency
      ? countryCurrency.symbolFormat.replace('{#}', '')
      : '$';
    return currency;
  }
}
