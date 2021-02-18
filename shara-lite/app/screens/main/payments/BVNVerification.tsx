import {Button} from '@/components';
import {getI18nService} from '@/services';
import {applyStyles, colors} from '@/styles';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import React from 'react';
import {Text, View} from 'react-native';
import {useAppNavigation} from '@/services/navigation';
import Emblem from '@/assets/images/emblem-gray.svg';
import {Page} from '@/components/Page';

const strings = getI18nService().strings;

export const BVNVerification = () => {
  const navigation = useAppNavigation();

  return (
    <Page
      header={{
        title: strings('payment.payment_container.payment_settings'),
        style: applyStyles('py-10'),
        iconLeft: {},
      }}
      style={applyStyles('px-32')}>
      <View style={applyStyles('center pt-32')}>
        <View style={applyStyles('items-center')}>
          <Emblem width={64} height={64} />
        </View>
        <Text
          style={applyStyles('text-center text-gray-200 text-base pt-16 px-8')}>
          {strings('payment.payment_container.no_payment_option.description')}
        </Text>
        <OTPInputView
          pinCount={6}
          autoFocusOnLoad={true}
          placeholderCharacter="•"
          style={applyStyles({
            width: '100%',
            height: 100,
          })}
          placeholderTextColor="#C4C4C4"
          codeInputFieldStyle={applyStyles('w-45 h-45 text-black', {
            fontSize: 18,
            borderWidth: 0,
            borderRadius: 0,
            borderBottomWidth: 1,
          })}
          codeInputHighlightStyle={applyStyles({
            borderColor: colors.primary,
          })}
        />
        <Button
          title={strings('done')}
          onPress={() => navigation.navigate('PaymentContainer')}
          style={applyStyles('w-full', {width: '48%'})}
        />
      </View>
    </Page>
  );
};
