import React, {ReactNode} from 'react';
import {View, ViewStyle, Text} from 'react-native';
import {applyStyles} from '@/helpers/utils';

type Props = {
  style?: ViewStyle;
  children: ReactNode;
};

export const Card = ({style, children}: Props) => {
  return (
    <View
      style={applyStyles('w-full p-lg elevation-3 bg-white rounded-16', style)}>
      {children}
    </View>
  );
};

type CardHeaderProps = {
  style?: ViewStyle;
  children: ReactNode;
};

export const CardHeader = ({style, children}: CardHeaderProps) => {
  return (
    <Text style={applyStyles('font-bold text-base text-700', style)}>
      {children}
    </Text>
  );
};

type CardDetailProps = {
  style?: ViewStyle;
  name: string;
  value: string;
};

export const CardDetail = ({style, name, value}: CardDetailProps) => {
  return (
    <View style={applyStyles('', style)}>
      <Text style={applyStyles('text-base text-xs text-400 text-primary mb-2')}>
        {name}
      </Text>
      <Text style={applyStyles('text-base text-400')}>{value}</Text>
    </View>
  );
};
