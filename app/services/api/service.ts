import flatten from 'lodash/flatten';
import {IContact} from '../../models';
import Config from 'react-native-config';
import queryString from 'query-string';
import {IAuthService} from '../auth';
import {IStorageService} from '../storage';

export type Requester = {
  get: <T extends any = any>(
    url: string,
    params: {[key: string]: any},
  ) => Promise<ApiResponse<T>>;
  post: <T extends any = any>(
    url: string,
    data: {[key: string]: any},
  ) => Promise<ApiResponse<T>>;
  patch: <T extends any = any>(
    url: string,
    data: {[key: string]: any},
  ) => Promise<ApiResponse<T>>;
  delete: <T extends any = any>(
    url: string,
    data: {[key: string]: any},
  ) => Promise<void>;
};

export interface IApiService {
  requester: Requester;

  register(payload: {
    firstname: string;
    lastname: string;
    country_code: string;
    mobile: string;
    password: string;
  }): Promise<ApiResponse>;

  logIn(payload: {mobile: string; password: string}): Promise<ApiResponse>;

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
}

export class ApiService implements IApiService {
  constructor(
    private authService: IAuthService,
    private storageService: IStorageService,
  ) {}

  public requester: Requester = {
    get: <T extends any = any>(
      url: string,
      params: {[key: string]: string | number},
    ) => {
      return fetch(
        `${Config.API_BASE_URL}${url}?${queryString.stringify(params)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.authService.getToken() ?? ''}`,
            'Content-Type': 'application/json',
          },
        },
      ).then((...args) => this.handleFetchErrors<T>(...args) as T);
    },
    post: <T extends any = any>(url: string, data: {[key: string]: any}) => {
      return fetch(`${Config.API_BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((...args) => this.handleFetchErrors<T>(...args) as T);
    },
    patch: <T extends any = any>(url: string, data: {[key: string]: any}) => {
      return fetch(`${Config.API_BASE_URL}${url}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((...args) => this.handleFetchErrors<T>(...args) as T);
    },
    delete: <T extends any = any>(url: string, data: {[key: string]: any}) => {
      return fetch(`${Config.API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((...args) => this.handleFetchErrors<T>(...args));
    },
  };

  private handleFetchErrors = async <T extends any>(
    response: Response,
  ): Promise<T | void> => {
    if (!response.ok) {
      const jsonResponse = await response.json();
      if (jsonResponse.message.includes('E_INVALID_JWT_TOKEN')) {
        this.authService.logOut();
      }
      return Promise.reject(new Error(jsonResponse.message));
    }
    if (response.status === 204) {
      return;
    }
    return (await response.json()) as Promise<T>;
  };

  public async register(payload: {
    firstname: string;
    lastname: string;
    mobile: string;
    password: string;
  }) {
    try {
      return await this.requester.post('/signup', payload);
    } catch (error) {
      throw error;
    }
  }

  public async logIn(payload: {mobile: string; password: string}) {
    try {
      const fetchResponse = await this.requester.post('/login', payload);
      const {
        data: {
          credentials: {token},
          user,
        },
      } = fetchResponse;
      await this.storageService.setItem('token', token);
      await this.storageService.setItem('user', user);
      this.authService.setToken(token);
      this.authService.setUser(user);
      return fetchResponse;
    } catch (error) {
      throw error;
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
}
