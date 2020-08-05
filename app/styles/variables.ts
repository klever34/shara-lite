import {Dimensions} from 'react-native';

export const dimensions = {
  fullHeight: Dimensions.get('window').height,
  fullWidth: Dimensions.get('window').width,
};

export const colors: {[key: string]: string} = {
  'red-50': '#F4B1B1',
  'red-200': '#DD0404',
  primary: '#dd0404',
  white: '#FFF',
  'gray-10': '#F5F5F5',
  'gray-20': '#EBE6E6',
  'gray-50': '#B9B9B9',
  'gray-100': '#8A8181',
  'gray-200': '#5E5959',
  'gray-300': '#363636',
  'gray-900': '#1A202C',
  green: '#20C720',
  black: '#222222',
};

const sizes = [
  0,
  1,
  2,
  4,
  6,
  8,
  12,
  16,
  20,
  24,
  28,
  32,
  40,
  48,
  56,
  64,
  72,
  80,
  96,
];

export const spacing: {[key: string]: number} = {
  ...sizes.reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: curr,
    };
  }, {}),
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
