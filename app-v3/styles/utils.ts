import {TextStyle, ViewStyle} from 'react-native';
import {Falsy} from 'types-v3/app';
import {globalStyles} from 'app-v3/styles/global';

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
