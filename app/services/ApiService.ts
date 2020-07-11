import {getAuthService} from './index';
import {handleFetchErrors} from '../helpers/utils';
import Config from 'react-native-config';
import flatten from 'lodash/flatten';

type Requester = {
  post: <T extends any = any>(
    url: string,
    data: {[key: string]: any},
  ) => Promise<ApiResponse<T>>;
};

export const requester: Requester = {
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
}
