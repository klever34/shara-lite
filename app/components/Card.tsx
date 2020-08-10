import React from 'react';
import {View, ViewStyle} from 'react-native';
import {applyStyles} from '../helpers/utils';

type Props = {
  style: ViewStyle;
  children: React.ReactNode;
};

export const Card = ({style, children}: Props) => {
  return (
    <View style={applyStyles('w-full', {elevation: 3}, style)}>{children}</View>
  );
};
