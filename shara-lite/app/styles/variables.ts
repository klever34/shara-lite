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
  // Brand Colors
  whatsapp: '#1BA058',
  // Neutral Colors
  white: '#FFF',
  'gray-10': '#F5F5F5',
  'gray-20': '#EBE6E6',
  'gray-50': '#B9B9B9',
  'gray-100': '#8A8181',
  'gray-200': '#5E5959',
  'gray-300': '#363636',
  'gray-900': '#1A202C',
  black: '#222222',
  // Neutral Colors
  'red-10': '#FFE7E7',
  'red-30': '#FFE2E2',
  'red-50': '#F4B1B1',
  'red-100': '#E85656',
  'red-200': '#DD0404',
  // Greens
  'green-50': '#D8F0EA',
  'green-100': '#0EC99C',
  'green-200': '#25A36E',
  'green-300': '#1B8B70',
  green: '#20C720',
  // Blues
  'blue-10': '#D8E6FB',
  'blue-100': '#386EC4',
  //Yellow
  'yellow-50': '#FFE7A9',
  'yellow-100': '#F2B109',
  // App Colors
  secondary: '#386EC4',
  primary: '#25A36E',
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
  18,
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

export const applySpacing = (size: number | string): number => {
  if (!isNaN(Number(size))) {
    size = Number(size);
    if (size < 4) {
      return size;
    }
    return spacing[size] ?? normalize(size);
  }
  return spacing[size] ?? 0;
};

export const applyFontSize = (size: number | string): number => {
  if (!isNaN(Number(size))) {
    size = Number(size);
    if (size <= 10) {
      return size;
    }
    return spacing[size] ?? normalize(size);
  }
  return spacing[size] ?? 0;
};

export const navBarHeight = normalize(80);
