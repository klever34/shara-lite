import {TextStyle, ViewStyle} from 'react-native';
import {Falsy} from 'types/app';
import {globalStyles} from '@/styles/global';

export type ClassName =
  | {[key: string]: any}
  | ViewStyle
  | TextStyle
  | string
  | Falsy;

export const applyStyles = (...styles: ClassName[]): {[key: string]: any} =>
  styles.reduce<{[key: string]: any}>((acc, curr) => {
    if (typeof curr === 'string') {
      const classNames = curr.split(' ');
      if (!classNames.length) {
        return acc;
      } else if (classNames.length === 1) {
        return {...acc, ...globalStyles[classNames[0]]};
      }
      return {...acc, ...applyStyles(...classNames)};
    }
    return {...acc, ...curr};
  }, {});

export const as = applyStyles;

export const appendPrefix = (
  prefix: string,
  values: {[key: string]: {[key: string]: string | number}},
) => {
  return Object.keys(values).reduce((prevValues, key) => {
    return {
      ...prevValues,
      [`${prefix}-${key}`]: values[key],
    };
  }, {});
};
