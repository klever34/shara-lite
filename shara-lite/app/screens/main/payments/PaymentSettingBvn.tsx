import {AppInput, Button} from '@/components';
import {applyStyles} from '@/styles';
import React, {useCallback} from 'react';
import {Text, View} from 'react-native';
import {Page} from '@/components/Page';
import {getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import Emblem from '@/assets/images/emblem-gray.svg';

const strings = getI18nService().strings;

export const PaymentSettingBvn = () => {
  const navigation = useAppNavigation();

  const handleSubmit = useCallback(() => {
    requestAnimationFrame(() => {
      navigation.navigate('BVNVerification');
    });
  }, [navigation]);

  return (
    <Page style={applyStyles('px-14')}>
      <View style={applyStyles('center pb-32')}>
        <Emblem width={64} height={64} />
        <Text
          style={applyStyles('text-center text-gray-200 text-base pt-16 px-8')}>
          {strings('payment.withdrawal_method.bvn_description')}
        </Text>
      </View>
      <AppInput
        keyboardType="numeric"
        placeholder={strings(
          'payment.withdrawal_method.bvn_input_field_placeholder',
        )}
      />
      <View style={applyStyles('pt-24 items-center')}>
        <Button
          title={strings('next')}
          onPress={handleSubmit}
          style={applyStyles({width: '48%'})}
        />
      </View>
    </Page>
  );
};
