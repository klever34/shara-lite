import React from 'react';
import {Text, View} from 'react-native';
import {applyStyles, colors} from '@/styles';
import {HeaderBackButton, HeaderBackButtonProps} from './HeaderBackButton';

type HeaderTitleProps = {
  title: string;
  iconLeft?: HeaderBackButtonProps;
  iconRight?: HeaderBackButtonProps;
};

export const Header = ({title, iconLeft, iconRight}: HeaderTitleProps) => {
  return (
    <View
      style={applyStyles('flex-row py-8 bg-white relative', {
        borderBottomWidth: 1,
        borderBottomColor: colors['gray-10'],
      })}>
      {iconLeft && (
        <View style={applyStyles('absolute h-full top-8')}>
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
        <View style={applyStyles('absolute h-full top-8')}>
          <HeaderBackButton {...iconRight} />
        </View>
      )}
    </View>
  );
};
