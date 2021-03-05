import {withModal} from '@/helpers/hocs';
import {applyStyles} from '@/styles';
import React from 'react';
//@ts-ignore
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import {Page} from '@/components/Page';
import {getI18nService} from '@/services';
import {PaymentSettingBvn} from './PaymentSettingBvn';
const strings = getI18nService().strings;

function WithdrawalMethod() {
  return (
    <Page
      header={{
        title: strings('payment.payment_container.payment_settings'),
        style: applyStyles('py-8'),
        iconLeft: {},
      }}
      style={applyStyles('px-0')}>
      <KeyboardAwareScrollView
        nestedScrollEnabled
        persistentScrollbar={true}
        keyboardShouldPersistTaps="always"
        style={applyStyles('py-18 bg-white flex-1')}>
        <PaymentSettingBvn />
      </KeyboardAwareScrollView>
    </Page>
  );
}

export default withModal(WithdrawalMethod);
