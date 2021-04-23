import React from 'react';
import {applyStyles, as} from '@/styles';
import {Text, View} from 'react-native';
import {Button} from '@/components';
import {useAppNavigation} from '@/services/navigation';
import Emblem from '@/assets/images/emblem-gray.svg';
import {Page} from '@/components/Page';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

export const NotSetTransactionPinModal = () => {
  const navigation = useAppNavigation();

  return (
    <View style={applyStyles('items-center py-24')}>
      <Text
        style={applyStyles(
          'text-gray-200 text-500 text-lg text-center pt-8 pb-20 px-12',
        )}>
        {strings('withdrawal_pin.not_set_transaction_pin_text')}
      </Text>
      <Button
        title={strings('withdrawal_pin.not_set_transaction_pin_button')}
        style={as('w-1/2')}
        onPress={() => {
          navigation.navigate('SecuritySettings', {});
        }}
      />
    </View>
  );
};

export const NotSetTransactionPinPage = () => {
  const navigation = useAppNavigation();

  return (
    <Page
      header={{
        iconLeft: {},
        title: strings('withdrawal_pin.security_settings'),
        style: applyStyles('py-8'),
      }}
      style={applyStyles('flex-1 bg-white py-64 mt-64')}>
      <View style={as('flex-1 center px-32 py-64')}>
        <Emblem width={64} height={64} />
        <Text style={as('text-center mt-24 mb-32 text-gray-200')}>
          {strings('withdrawal_pin.not_set_transaction_pin')}
        </Text>
        <Button
          title={strings('withdrawal_pin.not_set_transaction_pin_button')}
          style={as('w-full')}
          onPress={() => {
            navigation.navigate('SecuritySettings', {});
          }}
        />
      </View>
    </Page>
  );
};
