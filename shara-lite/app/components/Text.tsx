import {TextProps as RNTextProps, Text as RNText} from 'react-native';
import React, {ReactNode} from 'react';
import {applyStyles} from '@/styles';

type TextProps = RNTextProps & {
  children: ReactNode;
};

export const Text = ({style, children, ...restProps}: TextProps) => {
  return (
    <RNText style={applyStyles('text-base', style)} {...restProps}>
      {children}
    </RNText>
  );
};
