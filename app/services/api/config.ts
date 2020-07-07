import {getAuthService} from '../index';
import {handleFetchErrors} from '../../helpers/utils';
import Config from 'react-native-config';

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
