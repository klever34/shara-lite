import 'react-native-get-random-values';
import {v4 as uuidV4} from 'uuid';

export const generateUniqueId = () => uuidV4();

export const mergeStyles = (...styles: {[key: string]: any}[]) =>
  styles.reduce((acc, curr) => ({...acc, ...curr}), {});
