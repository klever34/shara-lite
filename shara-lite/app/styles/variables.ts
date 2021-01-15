import {Dimensions, Platform} from 'react-native';
import ExtraDimensions from 'react-native-extra-dimensions-android';

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
  'green-100': '#0EC99C',
  'green-200': '#25A36E',
  black: '#222222',
  whatsapp: '#1BA058',
  blue: '#386EC4',
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
      [curr]: curr,
    };
  }, {}),
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const navBarHeight = 80;
