import 'react-native-get-random-values';
import {v4 as uuidV4} from 'uuid';
import promiseRetry from 'promise-retry';
import addDays from 'date-fns/addDays';
import CryptoJS from 'crypto-js';
import Config from 'react-native-config';
import {getAuthService} from 'app-v3/services';
import {ReactElement} from 'react';

export const generateUniqueId = () => uuidV4();

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
      [key]: String(object[key]),
    };
  }, {});
};

export const getCustomerWhatsappNumber = (
  number?: string,
  userCountryCode?: string,
) => {
  if (number) {
    const mobile = number;
    if (userCountryCode && mobile?.includes(userCountryCode)) {
      return `${userCountryCode}${number
        .replace(userCountryCode, '')
        .replace(/[\s-]+/g, '')
        .substring(1)}`;
    }
    if (userCountryCode && mobile?.includes(`+${userCountryCode}`)) {
      return `${userCountryCode}${number
        .replace(`+${userCountryCode}`, '')
        .replace(/[\s-]+/g, '')
        .substring(1)}`;
    }
    return `${userCountryCode}${number.replace(/[\s-]+/g, '').substring(1)}`;
  }
};

export const renderList = <T extends {}>(
  list: T[],
  renderItem: (item: T, index: number, list: T[]) => ReactElement,
  emptyState?: ReactElement,
) => {
  if (!list.length) {
    return emptyState ?? null;
  } else {
    return list.map((...args) => renderItem(...args));
  }
};

export const prepareValueForSearch = (text: any): string => {
  if (!text) {
    return '';
  }
  return String(text).toLowerCase();
};
