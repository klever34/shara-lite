import 'react-native-get-random-values';
import {v4 as uuidV4} from 'uuid';

export const getUUID = () => uuidV4();

export const mergeStyles = (...styles: {[key: string]: any}[]) =>
  styles.reduce((acc, curr) => ({...acc, ...curr}), {});

export const convertTimeTokenToDate = (timetoken: string | number) => {
  return new Date(Number(timetoken) / 10000);
};
