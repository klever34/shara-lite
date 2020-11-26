import React, {ReactNode} from 'react';
import {Text} from 'react-native';
import {applyStyles} from '@/styles';

type TabBarLabelProps = {
  focused: boolean;
  children: ReactNode;
};

export const TabBarLabel = ({children, focused}: TabBarLabelProps) => {
  return (
    <Text
      style={applyStyles(
        focused ? 'text-gray-300 text-700' : 'text-gray-200',
        'uppercase',
        {
          fontSize: 9,
        },
      )}>
      {children}
    </Text>
  );
};
