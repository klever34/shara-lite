import {dimensions, spacing} from './variables'
import {StyleSheet} from 'react-native'

export const globalStyles: {[key: string]: any} = StyleSheet.create({
  'flex-row': {
    flexDirection: 'row',
  },
  'flex-col': {
    flexDirection: 'column',
  },
  'justify-center': {
    justifyContent: 'center',
  },
  'justify-space-between': {
    justifyContent: 'space-between',
  },
  'items-center': {
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  'flex-1': {
    flex: 1,
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
  'font-normal': {
    fontWeight: 'normal',
  },
  'font-bold': {
    fontWeight: 'bold',
  },
  ...Object.keys(spacing).reduce((acc, curr) => {
    return {
      ...acc,
      [`p-${curr}`]: {padding: spacing[curr]},
      [`py-${curr}`]: {paddingVertical: spacing[curr]},
      [`px-${curr}`]: {paddingHorizontal: spacing[curr]},
      [`pt-${curr}`]: {paddingTop: spacing[curr]},
      [`pb-${curr}`]: {paddingBottom: spacing[curr]},
      [`pl-${curr}`]: {paddingLeft: spacing[curr]},
      [`pr-${curr}`]: {paddingRight: spacing[curr]},
    }
  }, {}),
  ...Object.keys(spacing).reduce((acc, curr) => {
    return {
      ...acc,
      [`m-${curr}`]: {margin: spacing[curr]},
      [`my-${curr}`]: {marginVertical: spacing[curr]},
      [`mx-${curr}`]: {marginHorizontal: spacing[curr]},
      [`mt-${curr}`]: {marginTop: spacing[curr]},
      [`mb-${curr}`]: {marginBottom: spacing[curr]},
      [`ml-${curr}`]: {marginLeft: spacing[curr]},
      [`mr-${curr}`]: {marginRight: spacing[curr]},
    }
  }, {}),
})
