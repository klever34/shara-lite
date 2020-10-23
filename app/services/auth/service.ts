import {IStorageService} from '../storage';
import {IPubNubService} from '../pubnub';
//@ts-ignore
import {getCurrency} from 'country-currency-map';
import {Business, User} from 'types/app';
import {IAnalyticsService} from '@/services/analytics';
import {handleError} from '@/services/error-boundary';

export interface IAuthService {
  initialize(): Promise<void>;

  getUser(): User | null;

  setUser(user: User): void;

  getToken(): string | null;

  setToken(token: string): void;

  getRealmCredentials(): any | null;

  setRealmCredentials(realmCredentials: any): void;

  isLoggedIn(): boolean;

  logOut(): void;

  getUserCurrency(): string;

  getUserCurrencyCode(): string;

  getBusinessInfo(): Business;
}

export class AuthService implements IAuthService {
  private user: User | null = null;
  private token: string | null = null;
  private realmCredentials: string | null = null;

  constructor(
    private storageService: IStorageService,
    private pubNubService: IPubNubService,
    private analyticsService: IAnalyticsService,
  ) {}

  public async initialize(): Promise<void> {
    try {
      const [user, token, realmCredentials] = await Promise.all([
        this.storageService.getItem<User>('user'),
        this.storageService.getItem<string>('token'),
        this.storageService.getItem<string>('realmCredentials'),
      ]);
      if (user && token) {
        this.setUser(user);
        this.setToken(token);
      }
      if (realmCredentials) {
        this.setRealmCredentials(realmCredentials);
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
    this.analyticsService.setUser(user).catch(handleError);
  }

  public setRealmCredentials(realmCredentials: any) {
    this.realmCredentials = realmCredentials;
  }

  public getRealmCredentials(): any | null {
    return this.realmCredentials;
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
        this.realmCredentials = null;
        await this.storageService.clear();
        this.pubNubService.getInstance()?.unsubscribeAll();
      }
    } catch (e) {
      throw e;
    }
  }

  public getUserCurrency(): string {
    const user = this.user;
    const countryCurrency =
      user?.currency_code && getCurrency(user?.currency_code);
    return countryCurrency
      ? countryCurrency.symbolFormat.replace('{#}', '')
      : '$';
  }

  public getUserCurrencyCode(): string {
    const user = this.user;
    return user?.currency_code ? user.currency_code : '';
  }

  public getBusinessInfo(): Business {
    const user = this.user;
    if (user?.businesses && user.businesses.length) {
      return user.businesses[0];
    }
    return {
      name: '',
      mobile: '',
      address: '',
      country_code: '',
      profile_image: undefined,
      id: '',
    } as Business;
  }
}
