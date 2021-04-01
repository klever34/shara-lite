import {getAuthService} from '@/services';
import {handleError} from '@/services/error-boundary';
import CryptoJS from 'crypto-js';
import addDays from 'date-fns/addDays';
import promiseRetry from 'promise-retry';
import * as React from 'react';
import {useCallback, useMemo, useState} from 'react';
import {Alert, ToastAndroid} from 'react-native';
import 'react-native-get-random-values';
import ImagePicker, {
  ImagePickerOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import {v4 as uuidV4} from 'uuid';

export const generateUniqueId = () => uuidV4();

export const numberWithCommas = (x: number | undefined) =>
  x
    ? Number.isInteger(x)
      ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      : x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : '0';

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

export const encryptText = (text: string) => {
  return CryptoJS.AES.encrypt(text, 'cnwr4h4uhpctzhvt').toString();
};

export const decryptText = (encryptedText: string) => {
  return CryptoJS.AES.decrypt(encryptedText, 'cnwr4h4uhpctzhvt').toString(
    CryptoJS.enc.Utf8,
  );
};

export const amountWithCurrency = (amount?: number) => {
  const authService = getAuthService();
  const currency = authService.getUserCurrency();
  return amount
    ? `${currency}${numberWithCommas(Math.abs(amount))}`
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

export type ImagePickerResult = Pick<ImagePickerResponse, 'uri'> & {
  type?: string;
  name?: string;
};

export const useImageInput = (
  initialUrl?: ImagePickerResult,
  options: ImagePickerOptions = {},
) => {
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const handleImageInputChange = useCallback(() => {
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        // do nothing
      } else if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        const {uri, type, fileName} = response;
        const extensionIndex = uri.lastIndexOf('.');
        const extension = uri.slice(extensionIndex + 1);
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        if (!allowedExtensions.includes(extension)) {
          return Alert.alert('Error', 'That file type is not allowed.');
        }
        const image = {
          uri,
          type,
          name: fileName ?? '',
        };
        setImageUrl(image);
      }
    });
  }, [options]);
  return useMemo(
    () => ({
      imageUrl,
      setImageUrl,
      handleImageInputChange,
    }),
    [handleImageInputChange, imageUrl],
  );
};

export const prepareValueForSearch = (text: any): string => {
  if (!text) {
    return '';
  }
  return String(text).toLowerCase();
};

type ToastPayload = {
  message: string;
  duration?: 'short' | 'long';
  gravity?: 'top' | 'center' | 'bottom';
};

export const showToast = (payload: ToastPayload) => {
  const {message, duration = 'short', gravity = 'top'} = payload;
  const durationType = {
    long: ToastAndroid.LONG,
    short: ToastAndroid.SHORT,
  } as {[key: string]: number};
  const gravityType = {
    top: ToastAndroid.TOP,
    center: ToastAndroid.CENTER,
    bottom: ToastAndroid.BOTTOM,
  } as {[key: string]: number};
  ToastAndroid.showWithGravityAndOffset(
    message,
    durationType[duration],
    gravityType[gravity],
    0,
    52,
  );
};

/**
 * https://github.com/gregberge/react-merge-refs
 */
export function mergeRefs<T = any>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>,
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

export const convertUriToBase64 = async (uri: string) => {
  try {
    const data = await RNFetchBlob.fs.readFile(uri, 'base64');
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const sortDatesRelativeToDate = (dates: Date[], date: Date) => {
  return dates
    .filter(function (d) {
      //@ts-ignore
      return d - date > 0;
    })
    .sort(function (a, b) {
      //@ts-ignore
      var distancea = Math.abs(date - a);
      //@ts-ignore
      var distanceb = Math.abs(date - b);
      return distancea - distanceb;
    });
};
