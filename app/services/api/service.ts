import flatten from 'lodash/flatten';
import {IContact} from '../../models';
import Config from 'react-native-config';
import queryString from 'query-string';
import {handleFetchErrors} from '../../helpers/utils';
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

  getUserDetails(mobiles: string[]): Promise<User[]>;

  getGroupMembers(groupId: number): Promise<GroupChatMember[]>;

  createGroupChat(
    name: string,
    members: IContact[],
  ): Promise<GroupChat & {members: IContact[]}>;

  addGroupChatMembers(
    groupChatId: number,
    members: IContact[],
  ): Promise<GroupChatMember[]>;
}

export class ApiService implements IApiService {
  public requester: Requester;
  constructor(
    private authService: IAuthService,
    private storageService: IStorageService,
  ) {
    this.requester = {
      get: <T extends any = any>(
        url: string,
        params: {[key: string]: string | number},
      ) => {
        return fetch(
          `${Config.API_BASE_URL}${url}?${queryString.stringify(params)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authService.getToken() ?? ''}`,
              'Content-Type': 'application/json',
            },
          },
        ).then((...args) => handleFetchErrors<T>(...args));
      },
      post: <T extends any = any>(url: string, data: {[key: string]: any}) => {
        return fetch(`${Config.API_BASE_URL}${url}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authService.getToken() ?? ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then((...args) => handleFetchErrors<T>(...args));
      },
    };
  }

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

  getUserDetails(mobiles: string[]): Promise<User[]> {
    const sizePerRequest = 20;
    const requestNo = Math.ceil(mobiles.length / sizePerRequest);
    return Promise.all(
      Array.from({length: requestNo}).map((_, index) => {
        return this.requester.post<{users: User[]}>('/users/check', {
          mobiles: mobiles.slice(
            sizePerRequest * index,
            sizePerRequest * index + sizePerRequest,
          ),
        });
      }),
    ).then((responses) => flatten<User>(responses.map(({data}) => data.users)));
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
      console.log('getGroupMembers Error: ', e);
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
      console.log('createGroupChat Error: ', e);
    }
  }

  async addGroupChatMembers(groupChatId: number, members: IContact[]) {
    console.log(members.map((member) => member.id));
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
      console.log('addGroupChatMembers Error: ', e);
      throw e;
    }
  }
}
