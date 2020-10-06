import React, {ReactNode} from 'react';
import {applyStyles} from '@/helpers/utils';
import {colors} from '@/styles';
import {SafeAreaView, Text, View} from 'react-native';
import {Button} from '@/components/Button';
import {Icon} from '@/components/Icon';

type ReceiptingContainerProps = {
  children: ReactNode;
};

export const ReceiptingContainer = ({children}: ReceiptingContainerProps) => {
  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <View style={applyStyles('flex-1')}>{children}</View>
      <View
        style={applyStyles('flex-row center justify-space-between px-md', {
          height: 80,
          elevation: 100,
          borderTopWidth: 1,
          backgroundColor: colors.white,
          borderTopColor: colors['gray-20'],
        })}>
        <View style={applyStyles({width: '48%'})}>
          <Button onPress={() => {}}>
            <View style={applyStyles('flex-row center')}>
              <Icon
                size={24}
                name="plus"
                type="feathericons"
                color={colors.white}
              />
              <Text
                style={applyStyles('text-400 text-uppercase pl-sm', {
                  fontSize: 16,
                  color: colors.white,
                })}>
                Create receipt
              </Text>
            </View>
          </Button>
        </View>
        <View style={applyStyles({width: '48%'})}>
          <Button onPress={() => {}} variantColor="clear">
            <View style={applyStyles('flex-row center')}>
              <Icon
                size={24}
                name="camera"
                type="feathericons"
                color={colors['gray-300']}
              />
              <Text
                style={applyStyles('text-400 text-uppercase pl-sm', {
                  fontSize: 16,
                  color: colors['gray-300'],
                })}>
                snap receipt
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};
