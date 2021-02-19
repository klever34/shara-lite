import React, {useCallback, useState} from 'react';
import {Header, Text} from '@/components';
import {getI18nService} from '@/services';
import {View} from 'react-native';
import {applyStyles, as} from '@/styles';
import {withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import ActionButtonSet from '@/components/ActionButtonSet';
import Touchable from '@/components/Touchable';
import Markdown from 'react-native-markdown-display';
import {AmountForm} from './AmountForm';

const markdownStyle = {
  body: applyStyles('text-gray-300 text-400 text-base mb-32'),
  textgroup: applyStyles('text-center'),
  em: applyStyles('text-500', {
    fontWeight: '500',
    fontStyle: 'normal',
  }),
};

const strings = getI18nService().strings;

type BankDetails = {bankName: string; accountNo: string};

type SelectWithdrawalAccountModalProps = {
  onClose: () => void;
  onDone: (selectedBankDetails: BankDetails) => void;
};

const SelectWithdrawalAccountModal = ({
  onClose,
  onDone,
}: SelectWithdrawalAccountModalProps) => {
  const bankAccounts: BankDetails[] = [
    {
      bankName: 'GTBank',
      accountNo: '1234566780',
    },
    {
      bankName: 'Mpesa',
      accountNo: '1122343551',
    },
  ];
  const [selectedBankDetails, setSelectedBankDetails] = useState<BankDetails>(
    bankAccounts[0],
  );
  const handleSelect = useCallback((bankDetails: BankDetails) => {
    setSelectedBankDetails(bankDetails);
  }, []);
  const handleDone = useCallback(() => {
    onDone(selectedBankDetails);
  }, [onDone, selectedBankDetails]);
  return (
    <View style={as('')}>
      <Header
        title={strings('payment_activities.select_withdrawal_account')}
        style={as('border-b-0 pt-12 pb-0')}
      />
      <View style={as('px-16 py-12')}>
        {bankAccounts.map((bankDetails) => {
          const {bankName, accountNo} = bankDetails;
          const isSelected = accountNo === selectedBankDetails.accountNo;
          return (
            <Touchable
              key={accountNo}
              onPress={() => {
                handleSelect(bankDetails);
              }}>
              <View
                style={as(
                  'flex-row border-1 border-gray-20 px-16 py-16 rounded-12 mb-16 items-center',
                )}>
                <View style={as('flex-1')}>
                  <Text style={as('uppercase mb-4 font-bold text-gray-300')}>
                    {bankName}
                  </Text>
                  <Text style={as('text-gray-300')}>{accountNo}</Text>
                </View>
                <View
                  style={as(
                    'w-18 h-18 border-1 rounded-18 center',
                    isSelected ? 'border-green-100' : 'border-gray-50',
                  )}>
                  <View
                    style={as(
                      'w-12 h-12',
                      isSelected
                        ? 'bg-green-100 border-1 border-green-100 rounded-12'
                        : '',
                    )}
                  />
                </View>
              </View>
            </Touchable>
          );
        })}
        <ActionButtonSet
          actionBtns={[
            {
              title: strings('cancel'),
              variantColor: 'clear',
              onPress: onClose,
            },
            {
              title: strings('payment_activities.withdraw'),
              onPress: handleDone,
            },
          ]}
        />
      </View>
    </View>
  );
};

type ConfirmationModalProps = {
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmationModal = ({onClose, onConfirm}: ConfirmationModalProps) => {
  return (
    <View style={as('')}>
      <Header
        title={strings('payment_activities.confirm_withdrawal')}
        style={as('border-b-0 pt-12 pb-0')}
      />
      <View style={as('px-24 py-12 items-center')}>
        <Markdown style={markdownStyle}>
          {strings('payment_activities.about_to_withdraw', {
            amount: amountWithCurrency(1000),
            bank_details: 'GTBank - 12345556780',
          })}
        </Markdown>
        <ActionButtonSet
          actionBtns={[
            {
              title: strings('cancel'),
              variantColor: 'clear',
              onPress: onClose,
            },
            {
              title: strings('done'),
              onPress: onConfirm,
            },
          ]}
        />
      </View>
    </View>
  );
};

type MoneyWithdrawScreenProps = {
  onClose: () => void;
};

const MoneyWithdrawModal = withModal<MoneyWithdrawScreenProps>(
  ({onClose, openModal, closeModal}) => {
    const walletBalance = 20000;
    const selectedBankAccount = 'WEMA Bank - 1234556780';
    const handleSelectWithdrawalAccount = useCallback(() => {
      openModal('bottom-half', {
        renderContent: () => (
          <SelectWithdrawalAccountModal
            onClose={closeModal}
            onDone={() => {
              closeModal();
            }}
          />
        ),
        showHandleNub: false,
      });
    }, [closeModal, openModal]);
    const handleNext = useCallback(() => {
      openModal('bottom-half', {
        renderContent: () => (
          <ConfirmationModal
            onClose={closeModal}
            onConfirm={() => {
              closeModal();
            }}
          />
        ),
        showHandleNub: false,
      });
    }, [closeModal, openModal]);
    return (
      <AmountForm
        header={{
          title: strings('payment_activities.withdraw'),
        }}
        leadText={`${strings(
          'payment_activities.wallet_balance',
        )}: ${amountWithCurrency(walletBalance)}`}
        onClose={onClose}
        actionItems={[
          {
            icon: 'calendar',
            leftSection: {
              title: selectedBankAccount,
              caption: strings('payment_activities.select_withdrawal_account'),
            },
            onPress: handleSelectWithdrawalAccount,
          },
          {
            icon: 'edit-2',
            leftSection: {
              title: strings('payment_activities.withdraw_fields.note.label'),
            },
          },
        ]}
        doneButton={{
          title: strings('next'),
          onPress: handleNext,
        }}
      />
    );
  },
);

export default MoneyWithdrawModal;
