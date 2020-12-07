import {applyStyles} from '@/styles';
import React, {ReactNode} from 'react';
import {View, ViewStyle} from 'react-native';

export const StickyFooter = ({
  style,
  children,
}: {
  style?: ViewStyle;
  children: ReactNode;
}) => {
  return (
    <View
      style={applyStyles(
        'w-full p-16 bg-white',
        {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.34,
          shadowRadius: 6.27,
          elevation: 10,
        },
        style,
      )}>
      {children}
    </View>
  );
};
