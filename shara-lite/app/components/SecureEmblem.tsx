import {applyStyles} from '@/styles';
import React from 'react';
import {Image, ImageStyle} from 'react-native';
import EMB_IMG from '@/assets/images/emblem-gray.svg';

export const SecureEmblem = ({style}: {style?: ImageStyle}) => {
  return (
    // <Image
    //   resizeMode="contain"
    //   style={applyStyles({width: 66, height: 66}, style)}
    //   source={require('@/assets/images/emblem.png')}
    // />
    <EMB_IMG style={applyStyles('mb-64')} />

  );
};
