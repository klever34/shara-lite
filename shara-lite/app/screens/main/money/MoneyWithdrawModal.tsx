import React, {ReactNode, useCallback, useState} from 'react';
import {Header, Text} from '@/components';
import {getApiService, getI18nService} from '@/services';
import {ScrollView, View} from 'react-native';
import {applyStyles, as} from '@/styles';
import {withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import ActionButtonSet from '@/components/ActionButtonSet';
import Touchable from '@/components/Touchable';
import Markdown from 'react-native-markdown-display';
import {AmountForm} from './AmountForm';
import {useDisbursementMethod} from '@/services/disbursement-method';
import {useWallet} from '@/services/wallet';
import {IDisbursementMethod} from '@/models/DisbursementMethod';
import {TransactionSuccessModal} from '@/components/TransactionSuccessModal';

const markdownStyle = {
  body: applyStyles('text-gray-300 text-400 text-base mb-32'),
  textgroup: applyStyles('text-center'),
  em: applyStyles('text-500', {
    fontWeight: '500',
    fontStyle: 'normal',
  }),
};

const strings = getI18nService().strings;

type SelectWithdrawalAccountModalProps = {
  onClose: () => void;
  onDone: (
    selectedDisbursementMethod: IDisbursementMethod & Realm.Object,
  ) => void;
};

const SelectWithdrawalAccountModal = ({
  onClose,
  onDone,
}: SelectWithdrawalAccountModalProps) => {
  const {getDisbursementMethods} = useDisbursementMethod();
  const methods = getDisbursementMethods() ?? [];
  const [selectedDisbursementMethod, setSelectedDisbursementMethod] = useState(
    methods[0],
  );
  let handleSelect = useCallback(
    (disbursementMethod: IDisbursementMethod & Realm.Object) => {
      setSelectedDisbursementMethod(disbursementMethod);
    },
    [],
  );
  const handleDone = useCallback(() => {
    onDone(selectedDisbursementMethod);
  }, [onDone, selectedDisbursementMethod]);
  return (
    <ScrollView style={as('')}>
      <Header
        title={strings('payment_activities.select_withdrawal_account')}
        style={as('border-b-0 pt-12 pb-0')}
      />
      <View style={as('px-16 py-12')}>
        {methods.map((disbursementMethod) => {
          if (!disbursementMethod.parsedAccountDetails) {
            return null;
          }
          const {bank_name, nuban} = disbursementMethod.parsedAccountDetails;
          const isSelected =
            nuban === selectedDisbursementMethod.parsedAccountDetails?.nuban;
          return (
            <Touchable
              key={nuban}
              onPress={() => {
                handleSelect(disbursementMethod);
              }}>
              <View
                style={as(
                  'flex-row border-1 border-gray-20 px-16 py-16 rounded-12 mb-16 items-center',
                )}>
                <View style={as('flex-1')}>
                  <Text style={as('uppercase mb-4 font-bold text-gray-300')}>
                    {bank_name}
                  </Text>
                  <Text style={as('text-gray-300')}>{nuban}</Text>
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
              title: strings('done'),
              onPress: handleDone,
            },
          ]}
        />
      </View>
    </ScrollView>
  );
};

type ConfirmationModalProps = {
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmationModal = ({
  children,
  onClose,
  onConfirm,
}: ConfirmationModalProps) => {
  return (
    <View style={as('')}>
      <Header
        title={strings('payment_activities.confirm_withdrawal')}
        style={as('border-b-0 pt-12 pb-0')}
      />
      <View style={as('px-24 py-12 items-center')}>
        {children}
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
    const {getPrimaryDisbursementMethod} = useDisbursementMethod();
    const {getWallet} = useWallet();
    const walletBalance = getWallet()?.balance ?? 0;
    const primaryDisbursementMethod = getPrimaryDisbursementMethod();
    const [disbursementMethod, setDisbursementMethod] = useState(
      primaryDisbursementMethod,
    );
    const withdrawAccountDetails = disbursementMethod?.parsedAccountDetails;
    const selectedBankAccount = !withdrawAccountDetails
      ? ''
      : `${withdrawAccountDetails.bank_name} - ${withdrawAccountDetails.nuban}`;
    const handleSelectWithdrawalAccount = useCallback(() => {
      openModal('bottom-half', {
        renderContent: () => (
          <SelectWithdrawalAccountModal
            onClose={closeModal}
            onDone={(selectedDisbursementMethod) => {
              setDisbursementMethod(selectedDisbursementMethod);
              closeModal();
            }}
          />
        ),
      });
    }, [closeModal, openModal]);
    const handleNext = useCallback(
      (amount: string) => {
        if (Number(amount) && disbursementMethod?.api_id) {
          openModal('bottom-half', {
            renderContent: () => (
              <ConfirmationModal
                onClose={closeModal}
                onConfirm={() => {
                  return getApiService()
                    .makeDisbursement({
                      amount: Number(amount),
                      disbursement_method_id: disbursementMethod.api_id,
                    })
                    .then((response) => {
                      console.log(response);
                      closeModal();
                      openModal('full', {
                        renderContent: () => (
                          <TransactionSuccessModal
                            subheading={strings(
                              'payment_activities.withdraw_success',
                              {
                                amount: amountWithCurrency(Number(amount)),
                                bank_details: selectedBankAccount,
                              },
                            )}
                            onDone={() => {
                              closeModal();
                              onClose();
                            }}
                          />
                        ),
                      });
                    })
                    .catch((e) => {
                      console.log(e.message);
                      closeModal();
                    });
                }}>
                <Markdown style={markdownStyle}>
                  {strings('payment_activities.about_to_withdraw', {
                    amount: amountWithCurrency(Number(amount)),
                    bank_details: selectedBankAccount,
                  })}
                </Markdown>
              </ConfirmationModal>
            ),
          });
        }
      },
      [closeModal, disbursementMethod, onClose, openModal, selectedBankAccount],
    );
    return (
      <AmountForm
        walletBalance={walletBalance}
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
            leftSection: selectedBankAccount
              ? {
                  title: selectedBankAccount,
                  caption: strings(
                    'payment_activities.select_withdrawal_account',
                  ),
                }
              : {
                  title: strings(
                    'payment_activities.select_withdrawal_account',
                  ),
                },
            onPress: handleSelectWithdrawalAccount,
          },
          // {
          //   icon: 'edit-2',
          //   leftSection: {
          //     title: strings('payment_activities.withdraw_fields.note.label'),
          //   },
          // },
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
