import {applyStyles} from '@/styles';
import React from 'react';
import {Image} from 'react-native';

export const SecureEmblem = () => {
  return (
    <Image
      resizeMode="contain"
      style={applyStyles({width: 66, height: 66})}
      source={require('@/assets/images/emblem.png')}
    />
  );
};
