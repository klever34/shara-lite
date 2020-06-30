import 'react-native-get-random-values';
import {v4 as uuidV4} from 'uuid';
import {globalStyles} from '../styles';

export const generateUniqueId = () => uuidV4();

export const applyStyles = (
  ...styles: ({[key: string]: any} | keyof typeof globalStyles)[]
) =>
  styles.reduce<{[key: string]: any}>((acc, curr) => {
    if (typeof curr === 'string') {
      return {...acc, ...globalStyles[curr]};
    }
    return {...acc, ...curr};
  }, {});
