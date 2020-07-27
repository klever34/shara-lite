import {Dimensions} from 'react-native';

export const dimensions = {
  fullHeight: Dimensions.get('window').height,
  fullWidth: Dimensions.get('window').width,
};

export const colors = {
  'red-50': '#F4B1B1',
  primary: '#dd0404',
  white: '#FFF',
  'gray-10': '#F5F5F5',
  'gray-20': '#EBE6E6',
  'gray-50': '#B9B9B9',
  'gray-100': '#8A8181',
  'gray-200': '#5E5959',
  'gray-300': '#363636',
  'gray-900': '#1A202C',
  black: '#222222',
};

export const spacing: {[key: string]: number} = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
