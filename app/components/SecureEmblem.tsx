import {applyStyles} from '@/styles';
import React from 'react';
import {Image, View, ViewStyle} from 'react-native';

export const SecureEmblem = ({style}: {style: ViewStyle}) => {
  return (
    <View
      style={applyStyles(
        {
          width: '20%',
        },
        style,
      )}>
      <Image
        resizeMode="contain"
        style={applyStyles('w-full')}
        source={require('@/assets/images/emblem.png')}
      />
    </View>
  );
};
