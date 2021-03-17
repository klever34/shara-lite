import React, {ReactNode, useCallback, useState} from 'react';
import {Header, Text, toNumber} from '@/components';
import {getAnalyticsService, getApiService, getI18nService} from '@/services';
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
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';

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
          const {
            nuban,
            account_label,
            provider_label,
          } = disbursementMethod.parsedAccountDetails;
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
                    {provider_label}
                  </Text>
                  <Text style={as('text-gray-300')}>{account_label}</Text>
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
    const {
      getPrimaryDisbursementMethod,
      getDisbursementMethods,
    } = useDisbursementMethod();
    const {getWallet} = useWallet();
    const walletBalance = getWallet()?.balance ?? 0;
    const primaryDisbursementMethod = getPrimaryDisbursementMethod();
    const [disbursementMethod, setDisbursementMethod] = useState(
      primaryDisbursementMethod,
    );
    const withdrawAccountDetails = disbursementMethod?.parsedAccountDetails;
    const selectedBankAccount = !withdrawAccountDetails
      ? ''
      : `${withdrawAccountDetails.provider_label} - ${withdrawAccountDetails.account_label}`;
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
        if (disbursementMethod?.api_id) {
          openModal('bottom-half', {
            renderContent: () => (
              <ConfirmationModal
                onClose={closeModal}
                onConfirm={() => {
                  return getApiService()
                    .makeDisbursement({
                      amount: toNumber(amount),
                      disbursement_method_id: disbursementMethod.api_id,
                    })
                    .then(() => {
                      getAnalyticsService()
                        .logEvent('moneyWithdrawn', {
                          amount: toNumber(amount),
                          bank_details: selectedBankAccount,
                        })
                        .then(() => {});
                      closeModal();
                      openModal('full', {
                        renderContent: () => (
                          <TransactionSuccessModal
                            subheading={strings(
                              'payment_activities.withdraw_success',
                              {
                                amount: amountWithCurrency(toNumber(amount)),
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
                      handleError(e);
                      closeModal();
                    });
                }}>
                <Markdown style={markdownStyle}>
                  {strings('payment_activities.about_to_withdraw', {
                    amount: amountWithCurrency(toNumber(amount)),
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
    // TODO: Add logic to check whether money settings is set up
    const disbursementMethods = getDisbursementMethods();
    const navigation = useAppNavigation();
    const onGoToMoneySettings = useCallback(() => {
      navigation.navigate('PaymentSettings');
    }, [navigation]);
    if (!disbursementMethods.length) {
      return (
        <View style={as('center px-32 py-16')}>
          <Text style={as('text-center font-bold text-2xl mb-8')}>
            {strings('payment_activities.not_withdrawal_acct.title')}
          </Text>
          <Text style={as('text-center leading-24 mb-32')}>
            {strings('payment_activities.not_withdrawal_acct.description')}
          </Text>
          <ActionButtonSet
            actionBtns={[
              {
                title: strings('payment_activities.not_withdrawal_acct.tag'),
                onPress: onGoToMoneySettings,
              },
            ]}
          />
        </View>
      );
    }
    const handleValidateAmountForm = useCallback(
      (values) => {
        const errors = {} as {amount: string};
        if (!values.amount) {
          errors.amount = strings(
            'payment_activities.withdraw_amount_required_error',
          );
        } else if (!!walletBalance && toNumber(values.amount) > walletBalance) {
          errors.amount = strings('payment_activities.withdraw_excess_error');
        } else if (toNumber(values.amount) < 10) {
          errors.amount = strings('payment_activities.withdraw_minimum_error', {
            amount: amountWithCurrency(10),
          });
        }
        return errors;
      },
      [walletBalance],
    );

    return (
      <AmountForm
        maxAmount={walletBalance}
        validateFn={handleValidateAmountForm}
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
