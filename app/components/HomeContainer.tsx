import {applyStyles} from '@/helpers/utils';
import {colors} from '@/styles';
import React, {ReactNode} from 'react';
import {Text, View, ViewStyle} from 'react-native';
import {Button} from './Button';
import {Icon} from './Icon';

type Props = {
  style?: ViewStyle;
  children: ReactNode;
  onSnapReceipt(): void;
  onCreateReceipt(): void;
};

export const HomeContainer = ({
  style,
  children,
  onSnapReceipt,
  onCreateReceipt,
}: Props) => {
  return (
    <View style={applyStyles('flex-1', {...style})}>
      <View style={applyStyles('flex-1')}>{children}</View>
      <View
        style={applyStyles('flex-row center justify-between px-md py-lg', {
          elevation: 100,
          borderTopWidth: 1,
          backgroundColor: colors.white,
          borderTopColor: colors['gray-20'],
        })}>
        <View style={applyStyles({width: '48%'})}>
          <Button onPress={onCreateReceipt}>
            <View style={applyStyles('flex-row center')}>
              <Icon
                size={24}
                name="plus"
                type="feathericons"
                color={colors.white}
              />
              <Text
                style={applyStyles(
                  'text-400 text-uppercase pl-sm text-xs text-white',
                )}>
                Create receipt
              </Text>
            </View>
          </Button>
        </View>
        <View style={applyStyles({width: '48%'})}>
          <Button onPress={onSnapReceipt} variantColor="clear">
            <View style={applyStyles('flex-row center')}>
              <Icon
                size={24}
                name="camera"
                type="feathericons"
                color={colors['gray-300']}
              />
              <Text
                style={applyStyles(
                  'text-400 text-uppercase pl-sm text-xs text-gray-300',
                )}>
                snap receipt
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </View>
  );
};
