import {dimensions, spacing, colors, applySpacing} from './variables';
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
  'items-start': {
    alignItems: 'flex-start',
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
  'w-1/2': {
    width: '50%',
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
  'h-3/10': {
    height: '30%',
  },
  'h-7/10': {
    height: '70%',
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
  'text-4xl': {
    fontSize: applySpacing(36),
    lineHeight: applySpacing(44),
  },
  'text-3xl': {
    fontSize: applySpacing(32),
    lineHeight: applySpacing(40),
  },
  'text-2xl': {
    fontSize: applySpacing(24),
    lineHeight: applySpacing(32),
  },
  'text-xl': {
    fontSize: applySpacing(20),
    lineHeight: applySpacing(24),
  },
  'text-lg': {
    fontSize: applySpacing(18),
    lineHeight: applySpacing(24),
  },
  'text-base': {
    fontSize: applySpacing(16),
    lineHeight: applySpacing(20),
  },
  'text-sm': {
    fontSize: applySpacing(14),
    lineHeight: applySpacing(20),
  },
  'text-xs': {
    fontSize: applySpacing(12),
    lineHeight: applySpacing(16),
  },
  'text-xxs': {
    fontSize: applySpacing(10),
    lineHeight: applySpacing(16),
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
  'body-300': {
    fontFamily: 'Rubik-Light',
  },
  'body-400': {
    fontFamily: 'Rubik-Regular',
  },
  'body-500': {
    fontFamily: 'Rubik-Medium',
  },
  'body-700': {
    fontFamily: 'Rubik-Bold',
  },
  'body-900': {
    fontFamily: 'Rubik-Black',
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
  'print-text-400': {
    fontFamily: 'VT323-Regular',
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
      [`p-${curr}`]: {padding: applySpacing(curr)},
      [`py-${curr}`]: {paddingVertical: applySpacing(curr)},
      [`px-${curr}`]: {paddingHorizontal: applySpacing(curr)},
      [`pt-${curr}`]: {paddingTop: applySpacing(curr)},
      [`pb-${curr}`]: {paddingBottom: applySpacing(curr)},
      [`pl-${curr}`]: {paddingLeft: applySpacing(curr)},
      [`pr-${curr}`]: {paddingRight: applySpacing(curr)},

      // margin
      [`m-${curr}`]: {margin: applySpacing(curr)},
      [`my-${curr}`]: {marginVertical: applySpacing(curr)},
      [`mx-${curr}`]: {marginHorizontal: applySpacing(curr)},
      [`mt-${curr}`]: {marginTop: applySpacing(curr)},
      [`mb-${curr}`]: {marginBottom: applySpacing(curr)},
      [`ml-${curr}`]: {marginLeft: applySpacing(curr)},
      [`mr-${curr}`]: {marginRight: applySpacing(curr)},

      // height
      [`h-${curr}`]: {height: applySpacing(curr)},

      // width
      [`w-${curr}`]: {width: applySpacing(curr)},

      // border
      [`rounded-${curr}`]: {borderRadius: applySpacing(curr)},
      [`border-${curr}`]: {borderWidth: applySpacing(curr)},
      [`border-t-${curr}`]: {borderTopWidth: applySpacing(curr)},
      [`border-b-${curr}`]: {borderBottomWidth: applySpacing(curr)},

      // line-height
      [`leading-${curr}`]: {lineHeight: applySpacing(curr)},

      // positions
      [`top-${curr}`]: {top: applySpacing(curr)},
      [`-top-${curr}`]: {top: applySpacing(curr) * -1},
      [`right-${curr}`]: {right: applySpacing(curr)},
      [`-right-${curr}`]: {right: applySpacing(curr) * -1},
      [`bottom-${curr}`]: {bottom: applySpacing(curr)},
      [`-bottom-${curr}`]: {bottom: applySpacing(curr) * -1},
      [`left-${curr}`]: {left: applySpacing(curr)},
      [`-left-${curr}`]: {left: applySpacing(curr) * -1},
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
