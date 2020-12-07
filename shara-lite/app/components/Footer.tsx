import React, {ReactNode} from 'react';
import {applyStyles} from '@/styles';
import {View} from 'react-native';

export type FooterProps = {children: ReactNode};

export const Footer = ({children}: FooterProps) => {
  return (
    <View
      style={applyStyles('w-full p-16 bg-white', {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
      })}>
      {children}
    </View>
  );
};
