import {Dimensions, Platform} from 'react-native';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import normalize from 'react-native-normalize';

export const dimensions = {
  fullHeight: Platform.select({
    android:
      ExtraDimensions.getRealWindowHeight() -
      ExtraDimensions.getSoftMenuBarHeight() -
      ExtraDimensions.getStatusBarHeight(),
    ios: Dimensions.get('window').height,
  }) as number,
  fullWidth: Dimensions.get('window').width,
};

export const colors: {[key: string]: string} = {
  'red-10': '#FFE7E7',
  'red-30': '#FFE2E2',
  'red-50': '#F4B1B1',
  'red-100': '#E85656',
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
  'green-10': '#D8F0EA',
  'green-100': '#0EC99C',
  'green-200': '#25A36E',
  black: '#222222',
  whatsapp: '#1BA058',
  blue: '#386EC4',
  'blue-10': '#D8E6FB',
};

const sizes = [
  0,
  1,
  2,
  4,
  6,
  8,
  10,
  12,
  14,
  16,
  20,
  24,
  28,
  32,
  36,
  40,
  48,
  56,
  60,
  64,
  72,
  80,
  96,
  104,
  112,
  120,
  128,
];

export const spacing: {[key: string]: number} = {
  ...sizes.reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: normalize(curr),
    };
  }, {}),
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(12),
  lg: normalize(16),
  xl: normalize(24),
};

export const navBarHeight = 80;
