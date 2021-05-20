import flatten from 'lodash/flatten';
import {IContact, ICustomer} from '@/models';
import Config from 'react-native-config';
import queryString from 'query-string';
import {ObjectId} from 'bson';
import perf from '@react-native-firebase/perf';
import {IAuthService} from '../auth';
import {IStorageService} from '../storage';
import {
  ApiResponse,
  BNPLBundle,
  Business,
  DisbursementProvider,
  GroupChat,
  GroupChatMember,
  PaymentProvider,
  User,
} from 'types/app';
import {BaseModelInterface} from '@/models/baseSchema';
import {getI18nService} from '@/services';
import {DisbursementOption} from '@/models/DisbursementMethod';
import {IReceipt} from '@/models/Receipt';

export type Requester = {
  get: <T extends any = any>(
    url: string,
    params: {[key: string]: any},
    isExternalDomain?: boolean,
  ) => Promise<ApiResponse<T>>;
  post: <T extends any = any>(
    url: string,
    data: {[key: string]: any},
    config?: {[key: string]: any},
  ) => Promise<ApiResponse<T>>;
  put: <T extends any = any>(
    url: string,
    data: {[key: string]: any},
    config?: {[key: string]: any},
  ) => Promise<ApiResponse<T>>;
  patch: <T extends any = any>(
    url: string,
    data: {[key: string]: any},
    config?: {[key: string]: any},
  ) => Promise<ApiResponse<T>>;
  delete: <T extends any = any>(
    url: string,
    data: {[key: string]: any},
  ) => Promise<void>;
};

export type UserProfileFormPayload = Pick<
  User,
  | 'firstname'
  | 'lastname'
  | 'mobile'
  | 'email'
  | 'country_code'
  | 'device_id'
  | 'referrer_code'
>;

export interface IApiService {
  requester: Requester;

  register(payload: {
    country_code: string;
    mobile: string;
    password: string;
    device_id: string;
  }): Promise<ApiResponse>;

  logIn(payload: {
    mobile: string;
    password: string;
    hash?: string;
  }): Promise<ApiResponse>;

  forgotPassword(payload: {mobile: string}): Promise<ApiResponse>;

  resetPassword(payload: {
    mobile: string;
    otp: string;
    password: string;
  }): Promise<ApiResponse>;

  getPaymentProviders(params: {
    country_code: string | undefined;
  }): Promise<PaymentProvider[]>;

  getDisbursementProviders(params: {
    country_code: string | undefined;
  }): Promise<DisbursementProvider[]>;

  getSyncedRecord(params: {
    model: string;
    _id: ObjectId;
  }): Promise<BaseModelInterface | null>;

  createOneOnOneChannel(mobile: string): Promise<string>;

  getUserDetails(mobiles: string[]): Promise<User[]>;

  getGroupMembers(groupId: number): Promise<GroupChatMember[]>;

  createGroupChat(
    name: string,
    members: IContact[],
  ): Promise<GroupChat & {members: IContact[]}>;

  updateGroupChat(
    id: string,
    data: {
      name?: string;
      description?: string;
    },
  ): Promise<GroupChat>;

  addGroupChatMembers(
    groupChatId: number | string,
    members: IContact[],
  ): Promise<GroupChatMember[]>;

  removeGroupChatMember(
    groupChatId: number | string,
    userId: number | string,
  ): Promise<void>;

  leaveGroupChat(
    groupChatId: number | string,
    userId: number | string,
  ): Promise<void>;

  setGroupAdmin(
    groupChatId: number | string,
    userId: number | string,
    isAdmin?: boolean,
  ): Promise<any>;

  businessSetup(payload: FormData): Promise<ApiResponse>;

  businessSetupUpdate(
    payload: FormData,
    businessId?: string,
  ): Promise<ApiResponse>;

  userProfileUpdate(payload: Partial<User>): Promise<ApiResponse>;

  backupData({data, type}: {data: any; type: string}): Promise<void>;

  getUserIPDetails(): Promise<any>;

  otp(payload: {
    mobile?: string;
    device_id?: string;
    country_code?: string;
  }): Promise<string>;

  fcmToken(payload: {token: string; platform?: string}): Promise<ApiResponse>;

  saveDisbursementMethod(
    payload: Omit<DisbursementOption, 'fieldsData'>,
  ): Promise<any>;

  deleteDisbursementMethod(
    disbursementMethodId: number | string,
  ): Promise<ApiResponse>;
  makeDisbursement(payload: {
    amount: number;
    disbursement_method_id: number;
    token: string;
  }): Promise<ApiResponse>;
  saveDrawdown(payload: {amount: number}): Promise<any>;
  makeDrawdownRepayment(payload: {amount: number}): Promise<any>;
  saveBNPLDrawdown(payload: {
    amount: number;
    customer_id: string;
    receipt_id: string;
    receipt_data?: IReceipt;
    bnpl_bundle_id?: number;
    customer_data?: ICustomer;
    takes_charge?: 'merchant' | 'client';
  }): Promise<any>;
  saveBNPLRepayment(payload: {
    amount: number;
    drawdown_id?: number;
  }): Promise<any>;
  verify(payload: {idNumber: string}): Promise<ApiResponse>;
  stkPush(payload: {
    business_id?: string;
    customer_id?: string;
    amount: number;
    mobile?: string;
    bnpl_drawdown_id?: number;
    purpose?: string;
  }): Promise<ApiResponse>;
  validate(payload: {otp: string}): Promise<ApiResponse>;
  stkPushDeposit(payload: {
    amount: number;
    mobile?: string;
    purpose?: string;
  }): Promise<ApiResponse>;
  sendSMS(payload: {to: string; message: string}): Promise<ApiResponse>;
  getBNPLBundles(): Promise<BNPLBundle[]>;

  setTransactionPin(
    id: string,
    payload: {pin: string; confirm_pin: string},
  ): Promise<ApiResponse>;

  setSecurityQuestions(payload: {
    token: string;
    user_id: number;
    question: string;
    answer: string;
  }): Promise<ApiResponse>;

  verifyTransactionPin(
    id: string,
    payload: {pin: string},
  ): Promise<ApiResponse>;

  transactionPin(id: number): Promise<any>;

  getSecurityQuestions(id: number): Promise<any>;

  changeTransactionPin(
    id: string,
    payload: {
      pin: string;
      confirm_pin: string;
      token: string;
    },
  ): Promise<any>;

  verifySecurityQuestions(payload: {
    answer: string;
    user_id: number;
  }): Promise<any>;
}

export class ApiService implements IApiService {
  constructor(
    private authService: IAuthService,
    private storageService: IStorageService,
  ) {}

  public requester: Requester = {
    get: async <T extends any = any>(
      url: string,
      params: {[key: string]: string | number},
      isExternalDomain?: boolean,
    ) => {
      try {
        const fetchUrl = `${
          isExternalDomain ? '' : Config.API_BASE_URL
        }${url}?${queryString.stringify(params)}`;
        const headers: {Authorization?: string; 'Content-Type'?: string} = {};

        if (!isExternalDomain) {
          headers.Authorization = `Bearer ${this.authService.getToken() ?? ''}`;
          headers['Content-Type'] = 'application/json';
        }

        const trace = await perf().startTrace(url);
        const response = await fetch(fetchUrl, {
          method: 'GET',
          // @ts-ignore
          headers,
        });
        await trace.stop();
        return (await this.handleFetchErrors<T>(response)) as T;
      } catch (e) {
        throw this.handleNetworkErrors(e);
      }
    },
    post: async <T extends any = any>(
      url: string,
      data: {[key: string]: any},
      config?: {[key: string]: any},
    ) => {
      try {
        const trace = await perf().startTrace(url);
        const response = await fetch(`${Config.API_BASE_URL}${url}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.authService.getToken() ?? ''}`,
            'Content-Type': 'application/json',
            ...config?.headers,
          },
          body: config ? data : JSON.stringify(data),
        });
        await trace.stop();
        return (await this.handleFetchErrors<T>(response)) as T;
      } catch (e) {
        console.log(e);

        throw this.handleNetworkErrors(e);
      }
    },
    put: async <T extends any = any>(
      url: string,
      data: {[key: string]: any},
      config?: {[key: string]: any},
    ) => {
      try {
        const trace = await perf().startTrace(url);
        const response = await fetch(`${Config.API_BASE_URL}${url}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.authService.getToken() ?? ''}`,
            'Content-Type': 'application/json',
            ...config?.headers,
          },
          body: config ? data : JSON.stringify(data),
        });
        await trace.stop();
        return (await this.handleFetchErrors<T>(response)) as T;
      } catch (e) {
        throw this.handleNetworkErrors(e);
      }
    },
    patch: async <T extends any = any>(
      url: string,
      data: {[key: string]: any},
      config?: {[key: string]: any},
    ) => {
      try {
        console.log("patching");
        
        const trace = await perf().startTrace(url);
        console.log("patching 2");

        const response = await fetch(`${Config.API_BASE_URL}${url}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${this.authService.getToken() ?? ''}`,
            'Content-Type': 'application/json',
            ...config?.headers,
          },
          body: config ? data : JSON.stringify(data),
        });
        console.log("patching 3");
        await trace.stop();
        return (await this.handleFetchErrors<T>(response)) as T;
      } catch (e) {
        console.log('errror debugggg');
        console.log(e);
        
        throw this.handleNetworkErrors(e);
      }
    },
    delete: async <T extends any = any>(
      url: string,
      data: {[key: string]: any},
    ) => {
      try {
        const trace = await perf().startTrace(url);
        const response = await fetch(`${Config.API_BASE_URL}${url}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.authService.getToken() ?? ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        await trace.stop();
        return (await this.handleFetchErrors<T>(response)) as T;
      } catch (e) {
        throw this.handleNetworkErrors(e);
      }
    },
  };

  private handleFetchErrors = async <T extends any>(
    response: Response,
  ): Promise<T | void> => {
    const i18nService = getI18nService();
    const parseMessage = (jsonResponse: any) =>
      jsonResponse.messageCode
        ? i18nService.strings(jsonResponse.messageCode)
        : jsonResponse.message;

    if (!response.ok) {
      const jsonResponse = await response.json();
      if (jsonResponse.message.includes('E_INVALID_JWT_TOKEN')) {
        this.authService.logOut();
      }
      return Promise.reject(new Error(parseMessage(jsonResponse)));
    }
    if (response.status === 204) {
      return;
    }

    const jsonResponse = await response.json();
    const updatedResponse = {
      ...jsonResponse,
      message: parseMessage(jsonResponse),
    };
    return updatedResponse as Promise<T>;
  };

  private handleNetworkErrors = (e: Error): Error => {
    if (e.name === 'TypeError') {
      return new Error("Oops! It seems you don't have internet access");
    }

    return e;
  };

  public async register(payload: {
    country_code: string;
    mobile: string;
    password: string;
    device_id: string;
  }) {
    try {
      const fetchResponse = await this.requester.post('/signup', payload);
      const {
        data: {
          credentials: {token},
          realmCredentials,
          user,
        },
      } = fetchResponse;
      await this.storageService.setItem('token', token);
      await this.storageService.setItem('user', user);
      await this.storageService.setItem('realmCredentials', realmCredentials);
      this.authService.setToken(token);
      this.authService.setUser(user);
      this.authService.setRealmCredentials(realmCredentials);
      return fetchResponse;
    } catch (error) {
      throw error;
    }
  }

  public async logIn(payload: {
    mobile: string;
    password: string;
    hash?: string;
  }) {
    try {
      const fetchResponse = await this.requester.post('/auth/login', payload);
      const {
        data: {
          credentials: {token},
          realmCredentials,
          user,
        },
      } = fetchResponse;
      await this.storageService.setItem('token', token);
      await this.storageService.setItem('user', user);
      await this.storageService.setItem('realmCredentials', realmCredentials);
      this.authService.setToken(token);
      this.authService.setUser(user);
      this.authService.setRealmCredentials(realmCredentials);

      return fetchResponse;
    } catch (error) {
      throw error;
    }
  }

  public async forgotPassword(payload: {mobile: string}): Promise<ApiResponse> {
    try {
      return await this.requester.post('/password-reset', payload);
    } catch (e) {
      throw e;
    }
  }

  public async resetPassword(payload: {
    mobile: string;
    otp: string;
    password: string;
  }): Promise<any> {
    try {
      return await this.requester.patch('/password-reset', payload);
    } catch (e) {
      throw e;
    }
  }

  async getPaymentProviders({
    country_code,
  }: {
    country_code: string | undefined;
  }) {
    try {
      const {
        data: {paymentProviders},
      } = await this.requester.get<{paymentProviders: PaymentProvider[]}>(
        '/payment-provider',
        {country_code},
      );
      return paymentProviders;
    } catch (e) {
      throw e;
    }
  }

  async getDisbursementProviders({
    country_code,
  }: {
    country_code: string | undefined;
  }) {
    try {
      const {
        data: {disbursementProviders},
      } = await this.requester.get<{
        disbursementProviders: DisbursementProvider[];
      }>('/disbursement-provider', {country_code});
      return disbursementProviders;
    } catch (e) {
      throw e;
    }
  }

  async getSyncedRecord({model, _id}: {model: string; _id: ObjectId}) {
    try {
      const {
        data: {record},
      } = await this.requester.get<{
        paymentProviders: BaseModelInterface | null;
      }>('/sync/record', {model, _id});
      return record;
    } catch (e) {
      throw e;
    }
  }

  public async createOneOnOneChannel(recipient: string) {
    try {
      const {
        data: {channelName},
      } = await this.requester.post<{
        channelName: string;
      }>('/chat/channel', {
        recipient,
      });
      return channelName;
    } catch (e) {
      throw e;
    }
  }

  async getUserDetails(mobiles: string[]): Promise<User[]> {
    try {
      const sizePerRequest = 20;
      const requestNo = Math.ceil(mobiles.length / sizePerRequest);
      const responses = await Promise.all(
        Array.from({length: requestNo}).map((_, index) => {
          return this.requester.post<{users: User[]}>('/users/check', {
            mobiles: mobiles.slice(
              sizePerRequest * index,
              sizePerRequest * index + sizePerRequest,
            ),
          });
        }),
      );
      return flatten<User>(responses.map(({data}) => data.users));
    } catch (e) {
      throw e;
    }
  }

  async getGroupMembers(groupId: number) {
    try {
      const {
        data: {groupChatMembers},
      } = await this.requester.get<{groupChatMembers: GroupChatMember[]}>(
        '/group-chat-member',
        {
          group_chat_id: groupId,
        },
      );
      return groupChatMembers;
    } catch (e) {
      throw e;
    }
  }

  async createGroupChat(name: string, members: IContact[]) {
    try {
      const {
        data: {groupChat},
      } = await this.requester.post<{groupChat: GroupChat}>('/group-chat', {
        name,
      });
      await this.addGroupChatMembers(groupChat.id, members);
      return groupChat;
    } catch (e) {
      throw e;
    }
  }

  async updateGroupChat(
    id: string,
    data: {
      name?: string;
      description?: string;
    },
  ): Promise<GroupChat> {
    try {
      const {
        data: {groupChat},
      } = await this.requester.patch<{groupChat: GroupChat}>(
        `/group-chat/${id}`,
        data,
      );
      return groupChat;
    } catch (e) {
      throw e;
    }
  }

  async addGroupChatMembers(groupChatId: number, members: IContact[]) {
    try {
      const {
        data: {groupChatMembers},
      } = await this.requester.post<{groupChatMembers: GroupChatMember[]}>(
        '/group-chat-member/batch',
        {
          group_chat_id: groupChatId,
          user_ids: members.map((member) => member.id),
        },
      );
      return groupChatMembers;
    } catch (e) {
      throw e;
    }
  }

  async businessSetup(payload: FormData) {
    try {
      // console.log(businessId);
      console.log(payload);
      const fetchResponse = await this.requester.post('/business', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const {
        data: {business},
      }: {data: {business: Business}} = fetchResponse;

      let user = this.authService.getUser() as User;
      user = {...user, businesses: [business]};
      this.authService.setUser(user);
      await this.storageService.setItem('user', user);
      return fetchResponse;
    } catch (error) {
      throw error;
    }
  }

  async businessSetupUpdate(payload: FormData, businessId?: string) {
    try {
      console.log(businessId);
      console.log(payload);
      const fetchResponse = await this.requester.put(
        `/business/${businessId}`,
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('here ohhhh');
      

      const {
        data: {business},
      }: {data: {business: Business}} = fetchResponse;

      let user = this.authService.getUser() as User;
      console.log();

      user = {
        ...user,
        businesses: user.businesses.map((item) => {
          if (item.id === business.id) {
            return business;
          }
          return item;
        }),
      };
      this.authService.setUser(user);
      await this.storageService.setItem('user', user);
      return fetchResponse;
    } catch (error) {
      throw error;
      // console.log(error);
    }
  }

  async userProfileUpdate(payload: UserProfileFormPayload) {
    try {
      const fetchResponse = await this.requester.patch('/users/me', payload);
      const {
        data: {user},
      }: {data: {user: User}} = fetchResponse;

      let updatedUser = this.authService.getUser() as User;
      updatedUser = {
        ...updatedUser,
        ...user,
      };
      this.authService.setUser(updatedUser);
      await this.storageService.setItem('user', updatedUser);
      return fetchResponse;
    } catch (error) {
      throw error;
    }
  }

  async backupData({data, type}: {data: any; type: 'string'}) {
    try {
      await this.requester.post('/backup', {
        data,
        type,
      });
    } catch (e) {
      throw e;
    }
  }

  async getUserIPDetails() {
    try {
      return this.requester.get(
        'https://api.ipgeolocation.io/ipgeo',
        {
          apiKey: Config.IP_GEOLOCATION_KEY,
        },
        true,
      );
    } catch (e) {
      throw e;
    }
  }

  async removeGroupChatMember(
    groupChatId: number | string,
    userId: number | string,
  ): Promise<any> {
    try {
      await this.requester.delete<{
        groupChatMembers: GroupChatMember[];
      }>('/group-chat-member', {group_chat_id: groupChatId, user_id: userId});
    } catch (e) {
      throw e;
    }
  }

  async leaveGroupChat(
    groupChatId: number | string,
    userId: number | string,
  ): Promise<any> {
    try {
      await this.requester.delete<{
        groupChatMembers: GroupChatMember[];
      }>('/group-chat-member/leave', {
        group_chat_id: groupChatId,
        user_id: userId,
      });
    } catch (e) {
      throw e;
    }
  }

  async setGroupAdmin(
    groupChatId: number | string,
    userId: number | string,
    isAdmin: boolean = true,
  ): Promise<any> {
    try {
      await this.requester.patch<{
        groupChatMembers: GroupChatMember[];
      }>('/group-chat-member/admin', {
        group_chat_id: groupChatId,
        user_id: userId,
        is_admin: isAdmin,
      });
    } catch (e) {
      throw e;
    }
  }

  async otp(payload: {
    mobile?: string;
    device_id?: string;
    country_code?: string;
  }): Promise<string> {
    try {
      const fetchResponse = await this.requester.post('/auth/otp', payload);
      const {message} = fetchResponse;

      return message;
    } catch (error) {
      throw error;
    }
  }

  async fcmToken(payload: {
    token: string;
    platform?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await this.requester.post('/fcm/token', payload);
      return response;
    } catch (error) {
      throw error;
    }
  }
  async saveDisbursementMethod(
    payload: Omit<DisbursementOption, 'fieldsData'>,
  ): Promise<any> {
    try {
      const fetchResponse = await this.requester.post(
        '/disbursement-method',
        payload,
      );
      return fetchResponse;
    } catch (error) {
      throw error;
    }
  }

  async deleteDisbursementMethod(
    disbursementMethodId: number | string,
  ): Promise<any> {
    try {
      await this.requester.delete(
        `/disbursement-method/${disbursementMethodId}`,
        {},
      );
    } catch (error) {
      throw error;
    }
  }

  async makeDisbursement(payload: {
    amount: number;
    disbursement_method_id: number;
    token: string;
  }): Promise<ApiResponse> {
    try {
      return await this.requester.post('/disbursement', payload);
    } catch (error) {
      throw error;
    }
  }

  async saveDrawdown(payload: {amount: number}): Promise<any> {
    try {
      const fetchResponse = await this.requester.post('/drawdown', payload);
      return fetchResponse;
    } catch (error) {
      throw error;
    }
  }

  async makeDrawdownRepayment(payload: {amount: number}): Promise<any> {
    try {
      const fetchResponse = await this.requester.post(
        '/drawdown-repayment',
        payload,
      );
      return fetchResponse;
    } catch (error) {
      throw error;
    }
  }

  async verify(payload: {idNumber: string}): Promise<ApiResponse> {
    try {
      return await this.requester.put('/identity/verify', payload);
    } catch (error) {
      throw error;
    }
  }

  async validate(payload: {otp: string}): Promise<ApiResponse> {
    try {
      return await this.requester.put('/identity/validate', payload);
    } catch (error) {
      throw error;
    }
  }

  async saveBNPLDrawdown(payload: {
    amount: number;
    receipt_id: string;
    customer_id: string;
    receipt_data?: IReceipt;
    customer_data?: ICustomer;
  }): Promise<any> {
    try {
      const fetchResponse = await this.requester.post(
        '/bnpl/drawdown',
        payload,
      );
      return fetchResponse;
    } catch (error) {
      throw error;
    }
  }

  async saveBNPLRepayment(payload: {
    amount: number;
    drawdown_id: number;
  }): Promise<any> {
    try {
      const fetchResponse = await this.requester.post(
        '/bnpl/repayment',
        payload,
      );
      return fetchResponse;
    } catch (error) {
      throw error;
    }
  }

  async stkPush(payload: {
    business_id?: string;
    customer_id?: string;
    amount: number;
    mobile?: string;
    purpose?: string;
  }): Promise<ApiResponse> {
    try {
      const fetchResponse = await this.requester.post(
        '/collections/kenya/mobile-money/mpesa/stk',
        payload,
      );
      return fetchResponse;
    } catch (error) {
      throw error;
    }
  }

  async stkPushDeposit(payload: {
    amount: number;
    mobile?: string;
  }): Promise<ApiResponse> {
    try {
      const fetchResponse = await this.requester.post(
        '/collections/kenya/mobile-money/mpesa/stk/wallet',
        payload,
      );
      return fetchResponse;
    } catch (error) {
      throw error;
    }
  }

  async sendSMS(payload: {to: string; message: string}): Promise<ApiResponse> {
    try {
      const fetchResponse = await this.requester.post('/sms', payload);
      return fetchResponse;
    } catch (error) {
      throw error;
    }
  }

  async getBNPLBundles() {
    try {
      const {
        data: {bnplBundles},
      } = await this.requester.get<{bnplBundles: BNPLBundle[]}>(
        '/bnpl/bundles',
        {},
      );
      return bnplBundles;
    } catch (e) {
      throw e;
    }
  }

  async setTransactionPin(
    id: string,
    payload: {pin: string; confirm_pin: string},
  ): Promise<ApiResponse> {
    try {
      return await this.requester.post('/pin', payload);
    } catch (error) {
      throw error;
    }
  }

  async setSecurityQuestions(payload: {
    user_id: number;
    token: string;
    answer: string;
    question: string;
  }): Promise<ApiResponse> {
    try {
      return await this.requester.post('/security-qa', payload);
    } catch (error) {
      throw error;
    }
  }

  async verifyTransactionPin(
    id: string,
    payload: {pin: string},
  ): Promise<ApiResponse> {
    try {
      return await this.requester.post('/pin/verify', payload);
    } catch (error) {
      throw error;
    }
  }

  async transactionPin() {
    try {
      return this.requester.get('/pin', {});
    } catch (error) {
      throw error;
    }
  }

  async getSecurityQuestions(id: number) {
    try {
      return this.requester.get('/security-qa', {user_id: id});
    } catch (error) {
      throw error;
    }
  }

  async changeTransactionPin(
    id: string,
    payload: {
      pin: string;
      confirm_pin: string;
      token: string;
    },
  ): Promise<ApiResponse> {
    try {
      return await this.requester.patch('/pin', payload);
    } catch (error) {
      throw error;
    }
  }

  async verifySecurityQuestions(payload: {
    answer: string;
    user_id: number;
  }): Promise<ApiResponse> {
    try {
      return await this.requester.post('/security-qa/verify', payload);
    } catch (error) {
      throw error;
    }
  }
}
