import 'react-native-get-random-values';
import {v4 as uuidV4} from 'uuid';
import promiseRetry from 'promise-retry';
import {globalStyles} from '../styles';
import CryptoJS from 'crypto-js';
import Config from 'react-native-config';

export const generateUniqueId = () => uuidV4();

export const applyStyles = (
  ...styles: ({[key: string]: any} | string)[]
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

export const formatCurrency = (amount: number) =>
  `&#8358;${numberWithCommas(amount)}`;
