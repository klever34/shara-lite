import React, {useCallback} from 'react';
import {AppInput, Header, Text} from '@/components';
import {getI18nService} from '@/services';
import {View} from 'react-native';
import {as} from '@/styles';
import {withModal} from '@/helpers/hocs';
import {useFormik} from 'formik';
import {amountWithCurrency} from '@/helpers/utils';
import ActionButtonSet from '@/components/ActionButtonSet';
import {TouchableActionItem} from '@/components/TouchableActionItem';

const strings = getI18nService().strings;

const SelectWithdrawalAccountModal = () => {
  return (
    <View style={as('')}>
      <Header
        title={strings('payment_activities.select_withdrawal_account')}
        style={as('border-b-0 pt-12 pb-0')}
      />
    </View>
  );
};

const ConfirmationModal = () => {
  return (
    <View style={as('')}>
      <Header
        title={strings('payment_activities.confirm_withdrawal')}
        style={as('border-b-0 pt-12 pb-0')}
      />
    </View>
  );
};

type MoneyWithdrawScreenProps = {
  onClose: () => void;
};

const MoneyWithdrawModal = withModal<MoneyWithdrawScreenProps>(
  ({onClose, openModal}) => {
    const walletBalance = 20000;
    const {values, handleChange} = useFormik({
      initialValues: {
        amount: '',
      },
      onSubmit: () => {},
    });
    const selectedBankAccount = 'WEMA Bank - 1234556780';
    const handleSelectWithdrawalAccount = useCallback(() => {
      openModal('bottom-half', {
        renderContent: () => <SelectWithdrawalAccountModal />,
        showHandleNub: false,
      });
    }, [openModal]);
    const handleNext = useCallback(() => {
      openModal('bottom-half', {
        renderContent: () => <ConfirmationModal />,
        showHandleNub: false,
      });
    }, [openModal]);
    return (
      <View style={as('')}>
        <Header
          title={strings('payment_activities.withdraw')}
          style={as('border-b-0 pt-12 pb-0')}
        />
        <View style={as('px-24 py-12')}>
          <AppInput
            value={values.amount}
            label={strings('payment_activities.withdraw_fields.amount.label')}
            onChangeText={handleChange('amount')}
            keyboardType="numeric"
          />
          <Text style={as('self-center mt-8 text-gray-200 text-sm')}>
            {strings('payment_activities.wallet_balance')}:{' '}
            {amountWithCurrency(walletBalance)}
          </Text>
          <TouchableActionItem
            icon="calendar"
            leftSection={{
              title: selectedBankAccount,
              caption: strings('payment_activities.select_withdrawal_account'),
              style: as('flex-col-reverse'),
            }}
            style={as('px-0 mt-16')}
            onPress={handleSelectWithdrawalAccount}
          />
          <TouchableActionItem
            icon="edit-2"
            leftSection={{
              title: strings('payment_activities.withdraw_fields.note.label'),
            }}
            style={as('px-0 mb-32')}
          />
          <ActionButtonSet
            actionBtns={[
              {
                title: strings('cancel'),
                variantColor: 'clear',
                onPress: onClose,
              },
              {title: strings('next'), onPress: handleNext},
            ]}
          />
        </View>
      </View>
    );
  },
);

export default MoneyWithdrawModal;
