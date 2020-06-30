import {dimensions} from './variables';
import {StyleSheet} from 'react-native';

export const globalStyles = StyleSheet.create({
  'flex-1': {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  'w-full': {
    width: '100%',
  },
  'w-screen': {
    width: dimensions.fullWidth,
  },
  'h-full': {
    height: '100%',
  },
  'h-screen': {
    height: dimensions.fullHeight,
  },
  'text-lg': {
    fontSize: 18,
    lineHeight: 24,
  },
  'text-base': {
    fontSize: 16,
    lineHeight: 20,
  },
  'text-sm': {
    fontSize: 14,
    lineHeight: 20,
  },
  'text-xs': {
    fontSize: 12,
    lineHeight: 16,
  },
  'font-bold': {
    fontWeight: 'bold',
  },
});
