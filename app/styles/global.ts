import {dimensions, spacing, colors} from './variables';
import {StyleSheet} from 'react-native';
import {appendPrefix} from './utils';

export const globalStyles: {[key: string]: any} = StyleSheet.create({
  ...appendPrefix('flex', {
    row: {
      flexDirection: 'row',
    },
    col: {
      flexDirection: 'column',
    },
  }),
  'justify-start': {
    justifyContent: 'flex-start',
  },
  'justify-center': {
    justifyContent: 'center',
  },
  'justify-end': {
    justifyContent: 'flex-end',
  },
  'justify-between': {
    justifyContent: 'space-between',
  },
  'justify-around': {
    justifyContent: 'space-around',
  },
  'items-center': {
    alignItems: 'center',
  },
  'items-end': {
    alignItems: 'flex-end',
  },
  'flex-wrap': {
    flexWrap: 'wrap',
  },
  'self-start': {
    alignSelf: 'flex-start',
  },
  'self-center': {
    alignSelf: 'center',
  },
  'self-end': {
    alignSelf: 'flex-end',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  'flex-1': {
    flex: 1,
  },
  relative: {
    position: 'relative',
  },
  absolute: {
    position: 'absolute',
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
  'text-center': {
    textAlign: 'center',
  },
  'text-left': {
    textAlign: 'left',
  },
  'text-right': {
    textAlign: 'right',
  },
  'text-uppercase': {
    textTransform: 'uppercase',
  },
  'text-capitalize': {
    textTransform: 'capitalize',
  },
  'text-2xl': {
    fontSize: 24,
    lineHeight: 32,
  },
  'text-xl': {
    fontSize: 20,
    lineHeight: 24,
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
  'text-300': {
    fontFamily: 'Roboto-Light',
  },
  'text-400': {
    fontFamily: 'Roboto-Regular',
  },
  'text-500': {
    fontFamily: 'Roboto-Medium',
  },
  'text-700': {
    fontFamily: 'Roboto-Bold',
  },
  'heading-100': {
    fontFamily: 'CocogoosePro-Thin',
  },
  'heading-300': {
    fontFamily: 'CocogoosePro-UltraLight',
  },
  'heading-400': {
    fontFamily: 'CocogoosePro-Light',
  },
  'heading-500': {
    fontFamily: 'CocogoosePro-SemiLight',
  },
  'heading-700': {
    fontFamily: 'CocogoosePro-Regular',
  },
  'overflow-hidden': {
    overflow: 'hidden',
  },
  'w-auto': {
    width: 'auto',
  },
  ...Object.keys(spacing).reduce((acc, curr) => {
    return {
      ...acc,
      // padding
      [`p-${curr}`]: {padding: spacing[curr]},
      [`py-${curr}`]: {paddingVertical: spacing[curr]},
      [`px-${curr}`]: {paddingHorizontal: spacing[curr]},
      [`pt-${curr}`]: {paddingTop: spacing[curr]},
      [`pb-${curr}`]: {paddingBottom: spacing[curr]},
      [`pl-${curr}`]: {paddingLeft: spacing[curr]},
      [`pr-${curr}`]: {paddingRight: spacing[curr]},

      // margin
      [`m-${curr}`]: {margin: spacing[curr]},
      [`my-${curr}`]: {marginVertical: spacing[curr]},
      [`mx-${curr}`]: {marginHorizontal: spacing[curr]},
      [`mt-${curr}`]: {marginTop: spacing[curr]},
      [`mb-${curr}`]: {marginBottom: spacing[curr]},
      [`ml-${curr}`]: {marginLeft: spacing[curr]},
      [`mr-${curr}`]: {marginRight: spacing[curr]},

      // height
      [`h-${curr}`]: {height: spacing[curr]},

      // width
      [`w-${curr}`]: {width: spacing[curr]},

      // border
      [`rounded-${curr}`]: {borderRadius: spacing[curr]},
      [`border-${curr}`]: {borderWidth: spacing[curr]},
      [`border-t-${curr}`]: {borderTopWidth: spacing[curr]},
      [`border-b-${curr}`]: {borderBottomWidth: spacing[curr]},

      // line-height
      [`leading-${curr}`]: {lineHeight: spacing[curr]},

      // positions
      [`top-${curr}`]: {top: spacing[curr]},
      [`-top-${curr}`]: {top: spacing[curr] * -1},
      [`right-${curr}`]: {right: spacing[curr]},
      [`-right-${curr}`]: {right: spacing[curr] * -1},
      [`bottom-${curr}`]: {bottom: spacing[curr]},
      [`-bottom-${curr}`]: {bottom: spacing[curr] * -1},
      [`left-${curr}`]: {left: spacing[curr]},
      [`-left-${curr}`]: {left: spacing[curr] * -1},
    };
  }, {}),
  ...Object.keys(colors).reduce((acc, curr) => {
    return {
      ...acc,
      [`bg-${curr}`]: {backgroundColor: colors[curr]},
      [`text-${curr}`]: {color: colors[curr]},
      [`border-${curr}`]: {borderColor: colors[curr]},
      [`border-t-${curr}`]: {borderTopColor: colors[curr]},
      [`border-b-${curr}`]: {borderBottomColor: colors[curr]},
    };
  }, {}),
  ...[0, 1, 2, 3, 4].reduce((acc, curr) => {
    return {
      ...acc,
      [`elevation-${curr}`]: {elevation: curr},
    };
  }, {}),
  uppercase: {
    textTransform: 'uppercase',
  },
});
