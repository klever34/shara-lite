import {Dimensions} from 'react-native';

export const dimensions = {
  fullHeight: Dimensions.get('window').height,
  fullWidth: Dimensions.get('window').width,
};

export const colors = {
  primary: '#dd0404',
  white: '#FFF',
  black: '#000',
  gray: '#111',
};

export const spacing: {[key: string]: number} = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
