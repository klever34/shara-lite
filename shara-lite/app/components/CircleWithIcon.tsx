import {applyStyles, colors} from '@/styles';
import React from 'react';
import {View, ViewStyle} from 'react-native';
import {Icon} from './Icon';

export interface CircleWithIconProps {
  icon: string;
  style?: ViewStyle;
  iconColor?: string;
}

export const CircleWithIcon = ({
  icon,
  style,
  iconColor = colors['green-100'],
}: CircleWithIconProps) => {
  return (
    <View style={applyStyles('center w-32 h-32 rounded-16 bg-green-50', style)}>
      <Icon size={16} name={icon} type="feathericons" color={iconColor} />
    </View>
  );
};
