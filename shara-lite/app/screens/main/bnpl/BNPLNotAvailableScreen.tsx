import {Button, SecureEmblem} from '@/components';
import {getI18nService} from '@/services';
import {applyStyles} from '@/styles';
import React from 'react';
import {Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const strings = getI18nService().strings;

export const BNPLNotAvailableScreen = ({onPress}: {onPress(): void}) => {
  return (
    <SafeAreaView style={applyStyles('flex-1 bg-white center px-16')}>
      <SecureEmblem style={applyStyles('w-80 h-80')} />
      <Text
        style={applyStyles('pb-16 pt-24 text-center text-gray-200 text-base', {
          width: 320,
        })}>
        {strings('bnpl.not_available.instruction')}
      </Text>
      <Button
        onPress={onPress}
        variantColor="blue"
        style={applyStyles('w-full')}
        title={strings('bnpl.not_available.button_text')}
      />
    </SafeAreaView>
  );
};
