import {AppInput, Button, SecureEmblem} from '@/components';
import {applyStyles} from '@/styles';
import React from 'react';
import {Text, View} from 'react-native';
import {Page} from '@/components/Page';
import {getI18nService} from '@/services';
const strings = getI18nService().strings;

export const PaymentSettingBvn = () => {
  return (
    <Page style={applyStyles('px-14')}>
      <View style={applyStyles('flex-1')}>
        <View style={applyStyles('center pb-32')}>
          <SecureEmblem />
          <Text
            style={applyStyles(
              'text-center text-gray-200 text-base pt-16 px-8',
            )}>
            {strings('payment.payment_container.no_payment_option.description')}
          </Text>
        </View>
        <AppInput
          placeholder={strings('payment.bvn_input_field_placeholder')}
        />
        <View style={applyStyles('pt-24')}>
          <Button
            title={strings('save')}
            style={applyStyles({width: '48%', marginLeft: 90})}
          />
        </View>
      </View>
    </Page>
  );
};
