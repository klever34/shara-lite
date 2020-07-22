import {getAuthService} from '../index';
import Config from 'react-native-config';
import queryString from 'query-string';
import {handleFetchErrors} from '../../helpers/utils';

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
