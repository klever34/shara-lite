import 'react-native-get-random-values';
import {v4 as uuidV4} from 'uuid';
import promiseRetry from 'promise-retry';
import addDays from 'date-fns/addDays';
import {globalStyles} from '../styles';
import CryptoJS from 'crypto-js';
import Config from 'react-native-config';
import {TextStyle, ViewStyle} from 'react-native';
import {getAuthService} from '../services';
import {Falsy} from '../../types/app';

export const generateUniqueId = () => uuidV4();

export const applyStyles = (
  ...styles: ({[key: string]: any} | ViewStyle | TextStyle | string | Falsy)[]
): {[key: string]: any} =>
  styles.reduce<{[key: string]: any}>((acc, curr) => {
    if (typeof curr === 'string') {
      const classNames = curr.split(' ');
      if (!classNames.length) {
        return acc;
      } else if (classNames.length === 1) {
        return {...acc, ...globalStyles[classNames[0]]};
      }
      return applyStyles(...classNames);
    }
    return {...acc, ...curr};
  }, {});

export const numberWithCommas = (x: number | undefined) =>
  x ? x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';

export const retryPromise = (
  promiseFn: () => Promise<any>,
  options: {predicate?: (error: any) => boolean} = {},
) => {
  const {predicate = () => true, ...restOptions} = options;
  return promiseRetry(
    (retry) => {
      return promiseFn().catch((error) => {
        if (predicate(error)) {
          retry(error);
        }
      });
    },
    {forever: true, ...restOptions},
  );
};

export const decrypt = (encryptedText: string) => {
  return CryptoJS.AES.decrypt(
    encryptedText,
    Config.PUBNUB_USER_CRYPT_KEY,
  ).toString(CryptoJS.enc.Utf8);
};

export const amountWithCurrency = (amount?: number) => {
  const authService = getAuthService();
  const currency = authService.getUserCurrency();
  return amount
    ? `${currency}${numberWithCommas(amount)}`
    : `${currency}${numberWithCommas(0)}`;
};

export const getDueDateValue = (value: number) => {
  return addDays(new Date(), value);
};

export const castObjectValuesToString = (object: {
  [key: string]: any;
}): {[key: string]: string} => {
  return Object.keys(object).reduce((acc, key) => {
    return {
      ...acc,
      [key]: String(key),
    };
  }, {});
};
