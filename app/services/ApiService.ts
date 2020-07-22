import {getAuthService} from './index';
import {handleFetchErrors} from '../helpers/utils';
import Config from 'react-native-config';
import flatten from 'lodash/flatten';
import queryString from 'query-string';
import {IContact} from '../models';

type Requester = {
  get: <T extends any = any>(
    url: string,
    params: {[key: string]: any},
  ) => Promise<ApiResponse<T>>;
  post: <T extends any = any>(
    url: string,
    data: {[key: string]: any},
  ) => Promise<ApiResponse<T>>;
};

export const requester: Requester = {
  get: <T extends any = any>(
    url: string,
    params: {[key: string]: string | number},
  ) => {
    const authService = getAuthService();
    return fetch(
      `${Config.API_BASE_URL}${url}?${queryString.stringify(params)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authService.getToken()}` ?? '',
          'Content-Type': 'application/json',
        },
      },
    ).then((...args) => handleFetchErrors<T>(...args));
  },
  post: <T extends any = any>(url: string, data: {[key: string]: any}) => {
    const authService = getAuthService();
    return fetch(`${Config.API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authService.getToken()}` ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((...args) => handleFetchErrors<T>(...args));
  },
};

export interface IApiService {
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

export default class ApiService implements IApiService {
  getUserDetails(mobiles: string[]): Promise<User[]> {
    const sizePerRequest = 20;
    const requestNo = Math.ceil(mobiles.length / sizePerRequest);
    return Promise.all(
      Array.from({length: requestNo}).map((_, index) => {
        return requester.post<{users: User[]}>('/users/check', {
          mobiles: mobiles.slice(
            sizePerRequest * index,
            sizePerRequest * index + sizePerRequest,
          ),
        });
      }),
    ).then((responses) => flatten<User>(responses.map(({data}) => data.users)));
  }
  async getGroupMembers(groupId: number) {
    return requester
      .get<{groupChatMembers: GroupChatMember[]}>('/group-chat-member', {
        group_chat_id: groupId,
      })
      .then((response) => response.data.groupChatMembers);
  }

  async createGroupChat(name: string, members: IContact[]) {
    try {
      const {
        data: {groupChat},
      } = await requester.post<{groupChat: GroupChat}>('/group-chat', {
        name,
      });
      await this.addGroupChatMembers(groupChat.id, members);
      return groupChat;
    } catch (e) {
      console.log('Error: ', e);
    }
  }

  async addGroupChatMembers(groupChatId: number, members: IContact[]) {
    console.log(members.map((member) => member.id));
    try {
      const {
        data: {groupChatMembers},
      } = await requester.post<{groupChatMembers: GroupChatMember[]}>(
        '/group-chat-member/batch',
        {
          group_chat_id: groupChatId,
          user_ids: members.map((member) => member.id),
        },
      );
      return groupChatMembers;
    } catch (e) {
      console.log('Error: ', e);
    }
  }
}
