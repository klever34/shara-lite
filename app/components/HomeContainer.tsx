import {applyStyles} from '@/helpers/utils';
import React, {ReactNode} from 'react';
import {Text, View, ViewStyle} from 'react-native';
import {Icon} from './Icon';
import {FAButton} from '@/components';

type Props = {
  style?: ViewStyle;
  children: ReactNode;
  onCreateReceipt(): void;
};

export const HomeContainer = ({style, children, onCreateReceipt}: Props) => {
  return (
    <View style={applyStyles('flex-1', {...style})}>
      <View style={applyStyles('flex-1')}>{children}</View>
      <FAButton
        style={applyStyles(
          'w-auto rounded-16 py-16 px-20 flex-row items-center',
        )}
        onPress={onCreateReceipt}>
        <Icon size={20} name="plus" color="white" type="feathericons" />
        <Text
          style={applyStyles(
            'text-400 text-uppercase pl-sm text-sm text-white',
          )}>
          Create Receipt
        </Text>
      </FAButton>
    </View>
  );
};
