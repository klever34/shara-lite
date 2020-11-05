import React from 'react';
import {Text, View, ViewStyle} from 'react-native';
import {applyStyles, colors} from '@/styles';
import {HeaderBackButton, HeaderBackButtonProps} from './HeaderBackButton';

export type HeaderTitleProps = {
  title: string;
  style?: ViewStyle;
  iconLeft?: HeaderBackButtonProps;
  iconRight?: HeaderBackButtonProps;
};

export const Header = ({
  title,
  style,
  iconLeft,
  iconRight,
}: HeaderTitleProps) => {
  return (
    <View
      style={applyStyles(
        'flex-row py-8 bg-white relative',
        {
          borderBottomWidth: 1,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.34,
          shadowRadius: 6.27,
          elevation: 10,
          borderBottomColor: colors['gray-10'],
        },
        style,
      )}>
      {iconLeft && (
        <View style={applyStyles('absolute h-full top-8 left-8')}>
          <HeaderBackButton {...iconLeft} />
        </View>
      )}
      <View style={applyStyles('flex-1 center flex-row h-36 mx-48')}>
        <Text
          style={applyStyles('text-500 text-uppercase text-gray-200')}
          numberOfLines={1}>
          {title}
        </Text>
      </View>
      {iconRight && (
        <View style={applyStyles('absolute h-full top-8 right-8')}>
          <HeaderBackButton {...iconRight} />
        </View>
      )}
    </View>
  );
};
