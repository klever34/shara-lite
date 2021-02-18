import React from 'react';
import {Header, Text, Button} from '@/components';
import {getI18nService} from '@/services';
import {View} from 'react-native';
import {as} from '@/styles';
import {useClipboard} from '@/helpers/hooks';
import Touchable from '@/components/Touchable';

const strings = getI18nService().strings;

type AccountDetailsCardProps = {
  label: string;
  accountNo: string;
  bankName?: string;
  copyMessage: string;
};

const AccountDetailsCard = ({
  label,
  accountNo,
  bankName,
  copyMessage,
}: AccountDetailsCardProps) => {
  const {copyToClipboard} = useClipboard();
  return (
    <Touchable
      onPress={() => {
        copyToClipboard(accountNo);
      }}>
      <View style={as('py-12 items-center w-full')}>
        <Text style={as(' text-gray-100')}>{label}</Text>
        <Text style={as('text-blue-100 font-bold text-2xl')}>{accountNo}</Text>
        {!!bankName && (
          <Text style={as('capitalize text-black font-bold')}>{bankName}</Text>
        )}
        <Text style={as('text-sm text-gray-50')}>{copyMessage}</Text>
      </View>
    </Touchable>
  );
};

type MoneyDepositScreenProps = {
  onClose: () => void;
};

export const MoneyDepositScreen = ({onClose}: MoneyDepositScreenProps) => {
  const merchantId = '12345667780';
  const virtualBankAccountNo = '12345667780';
  const virtualBankName = 'WEMA BANK';
  return (
    <View style={as('')}>
      <Header
        title={strings('payment_activities.deposit')}
        style={as('border-b-0 pt-12 pb-0')}
      />
      <View style={as('items-center px-16 py-12')}>
        <Text style={as('text-center text-sm mb-12 text-gray-200')}>
          {strings('payment_activities.deposit_help_text')}
        </Text>
        <AccountDetailsCard
          label={strings('payment_activities.your_merchant_id_is')}
          accountNo={merchantId}
          copyMessage={strings('payment_activities.tap_to_copy_merchant_id')}
        />
        <AccountDetailsCard
          label={strings('payment_activities.your_wallet_account_no_is')}
          accountNo={virtualBankAccountNo}
          bankName={virtualBankName}
          copyMessage={strings(
            'payment_activities.tap_to_copy_wallet_account_no',
          )}
        />
        <Button
          title={strings('close')}
          variantColor="clear"
          style={as('px-64 mt-24 mb-16')}
          onPress={onClose}
        />
      </View>
    </View>
  );
};
