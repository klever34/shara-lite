import React, {useCallback} from 'react';
import {Button, Header, Text} from '@/components';
import {getI18nService} from '@/services';
import {View} from 'react-native';
import {as} from '@/styles';
import {useClipboard} from '@/helpers/hooks';
import Touchable from '@/components/Touchable';
import {useCollectionMethod} from '@/services/collection-method';
import {useWallet} from '@/services/wallet';

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
          <Text style={as('uppercase text-black font-bold')}>{bankName}</Text>
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
  const {getWallet} = useWallet();
  const {getCollectionMethods} = useCollectionMethod();
  const wallet = getWallet();
  const collectionMethods = getCollectionMethods();
  const merchantId = wallet?.merchant_id;
  const parseBankDetails = useCallback((bankDetailsString: string): {
    vnuban: string;
    bank_name?: string;
  } | null => {
    try {
      return JSON.parse(bankDetailsString);
    } catch (e) {
      return null;
    }
  }, []);
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
        {merchantId && (
          <AccountDetailsCard
            label={strings('payment_activities.your_merchant_id_is')}
            accountNo={merchantId}
            copyMessage={strings('payment_activities.tap_to_copy_merchant_id')}
          />
        )}
        {collectionMethods.map((collectionMethod) => {
          const bankDetails = parseBankDetails(
            collectionMethod.account_details,
          );
          if (!bankDetails) {
            return null;
          }
          return (
            <AccountDetailsCard
              key={bankDetails.vnuban}
              label={strings('payment_activities.your_wallet_account_no_is')}
              accountNo={bankDetails.vnuban}
              bankName={bankDetails.bank_name}
              copyMessage={strings(
                'payment_activities.tap_to_copy_wallet_account_no',
              )}
            />
          );
        })}
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
