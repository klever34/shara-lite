// @ts-ignore
declare module 'country-currency-map';
// // @ts-ignore
// declare module 'react-native-bluetooth-escpos-printer';
//@ts-ignore
declare module 'react-native-check-app-install';

declare module 'react-native-extra-dimensions-android';

declare module '*.svg' {
  import React from 'react';
  import {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
