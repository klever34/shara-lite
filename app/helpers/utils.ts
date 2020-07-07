import 'react-native-get-random-values';
import {v4 as uuidV4} from 'uuid';
import {globalStyles} from '../styles';

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

export const handleFetchErrors = async <T extends any>(
  response: Response,
): Promise<T> => {
  if (!response.ok) {
    const jsonResponse = await response.json();
    return Promise.reject(
      new Error(jsonResponse.mesage || jsonResponse.message),
    );
  }
  return response.json();
};
