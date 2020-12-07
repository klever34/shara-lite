import {applyStyles} from '@/styles';
import React from 'react';
import {Image, ImageStyle} from 'react-native';

export const SecureEmblem = ({style}: {style?: ImageStyle}) => {
  return (
    <Image
      resizeMode="contain"
      style={applyStyles({width: 66, height: 66}, style)}
      source={require('@/assets/images/emblem.png')}
    />
  );
};
