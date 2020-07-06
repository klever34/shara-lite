import {Dimensions} from 'react-native'

export const dimensions = {
  fullHeight: Dimensions.get('window').height,
  fullWidth: Dimensions.get('window').width,
}

export const colors = {
  primary: '#dd0404',
  white: '#FFF',
  'gray-20': '#EBE6E6',
  'gray-50': '#B9B9B9',
  'gray-100': '#F7FAFC',
  'gray-200': '#EDF2F7',
  'gray-300': '#E2E8F0',
  'gray-400': '#CBD5E0',
  'gray-500': '#A0AEC0',
  'gray-600': '#718096',
  'gray-700': '#4A5568',
  'gray-800': '#2D3748',
  'gray-900': '#1A202C',
  black: '#000',
}

export const spacing: {[key: string]: number} = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
}
