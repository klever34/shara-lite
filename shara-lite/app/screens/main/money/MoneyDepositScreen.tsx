import {
  Button,
  CurrencyInput,
  Header,
  PhoneNumber,
  PhoneNumberField,
  Text,
  toNumber,
} from '@/components';
import ActionButtonSet from '@/components/ActionButtonSet';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {useClipboard} from '@/helpers/hooks';
import {amountWithCurrency} from '@/helpers/utils';
import {
  getAnalyticsService,
  getApiService,
  getAuthService,
  getI18nService,
} from '@/services';
import {useCollectionMethod} from '@/services/collection-method';
import {handleError} from '@/services/error-boundary';
import {useWallet} from '@/services/wallet';
import {applyStyles, as, colors} from '@/styles';
import {useFormik} from 'formik';
import {parsePhoneNumber} from 'libphonenumber-js';
import _ from 'lodash';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Markdown from 'react-native-markdown-display';

const strings = getI18nService().strings;

type AccountDetailsCardProps = {
  label: string;
  accountDetailsList: {
    vnuban: string;
    bank_name?: string;
  }[];
  copyMessage: string;
};

const AccountDetailsCard = ({
  label,
  accountDetailsList,
  copyMessage,
}: AccountDetailsCardProps) => {
  const {copyToClipboard} = useClipboard();
  if (!accountDetailsList.length) {
    return null;
  }
  return (
    <View style={as('py-12 items-center w-full')}>
      <Text style={as('text-gray-100')}>{label}</Text>
      {accountDetailsList.map((accountDetails) => {
        return (
          <Touchable
            key={accountDetails.vnuban}
            onPress={() => {
              copyToClipboard(accountDetails.vnuban);
            }}>
            <View
              key={accountDetails.vnuban}
              style={as('py-6 items-center w-full')}>
              <Text style={as('text-blue-100 font-bold text-2xl')}>
                {accountDetails.vnuban}
              </Text>
              {!!accountDetails.bank_name && (
                <Text style={as('uppercase text-black font-bold')}>
                  {accountDetails.bank_name}
                </Text>
              )}
              <Text style={as('text-sm text-gray-50')}>{copyMessage}</Text>
            </View>
          </Touchable>
        );
      })}
    </View>
  );
};

export const STKPushDeposit = ({
  onSubmit,
  onClose,
  initialValues,
}: {
  onClose(): void;
  initialValues?: {amount: string; mobile: string};
  onSubmit: (
    values: {amount: string; mobile?: string},
    setSubmitting: (isSubmitting: boolean) => void,
  ) => Promise<void>;
}) => {
  const user = getAuthService().getUser();
  const {getWallet} = useWallet();
  const wallet = getWallet();

  const phoneNumber = parsePhoneNumber('+' + user?.mobile);
  const nationalNumber = (phoneNumber?.nationalNumber ?? '') as string;

  const handleValidateForm = useCallback(
    (values) => {
      const errors = {} as {amount: string; mobile: string};
      if (!values.amount) {
        errors.amount = strings(
          'payment_activities.stk_push.fields.amount.errorMessage',
        );
      } else if (toNumber(values.amount) < 10) {
        errors.amount = strings('payment_activities.withdraw_minimum_error', {
          amount: amountWithCurrency(10),
        });
      } else if (!values.mobile) {
        errors.mobile = strings(
          'payment_activities.stk_push.fields.mobile.errorMessage',
        );
      } else if (
        wallet?.currency_code === 'KES' &&
        values.amount.includes('.')
      ) {
        errors.amount = strings('payment_activities.no_decimals');
      }
      return errors;
    },
    [wallet],
  );

  const {
    errors,
    values,
    touched,
    setFieldValue,
    handleSubmit,
    setSubmitting,
    isSubmitting,
  } = useFormik({
    onSubmit: ({mobile, amount}) => {
      onSubmit(
        {mobile: `${user?.country_code}${mobile}`, amount},
        setSubmitting,
      );
    },
    validate: handleValidateForm,
    initialValues: initialValues ?? {amount: '', mobile: nationalNumber},
  });

  const handleAmountChange = useCallback(
    (text: string) => {
      setFieldValue('amount', text);
    },
    [setFieldValue],
  );

  const handleMobileChange = useCallback(
    (value: PhoneNumber) => {
      setFieldValue('countryCode', user?.country_code);
      setFieldValue('mobile', value.number);
    },
    [setFieldValue, user],
  );

  return (
    <View style={applyStyles('px-16 py-24')}>
      <CurrencyInput
        errorMessage={errors.amount}
        value={toNumber(values.amount)}
        onChangeText={handleAmountChange}
        containerStyle={applyStyles('mb-24')}
        isInvalid={!!touched.amount && !!errors.amount}
        label={strings('payment_activities.stk_push.fields.amount.label')}
        placeholder={strings(
          'payment_activities.stk_push.fields.amount.placeholder',
        )}
      />
      <PhoneNumberField
        errorMessage={errors.mobile}
        onSubmitEditing={handleSubmit}
        containerStyle={applyStyles('mb-24')}
        isInvalid={!!touched.mobile && !!errors.mobile}
        onChangeText={(data) => handleMobileChange(data)}
        label={strings('payment_activities.stk_push.fields.mobile.label')}
        value={{
          number: values.mobile ?? '',
          callingCode: user?.country_code ?? '',
        }}
        placeholder={strings(
          'payment_activities.stk_push.fields.mobile.placeholder',
        )}
      />
      <ActionButtonSet
        actionBtns={[
          {
            title: strings('cancel'),
            variantColor: 'clear',
            onPress: onClose,
          },
          {
            variantColor: 'blue',
            onPress: handleSubmit,
            title: strings('send'),
            isLoading: isSubmitting,
          },
        ]}
      />
    </View>
  );
};

export const STKPushConfirmation = ({
  onClose,
  mobile,
}: {
  onClose(): void;
  mobile: string;
}) => (
  <>
    <View style={applyStyles('px-16 pt-24')}>
      <Text
        style={applyStyles(
          'pb-8 text-center text-700 text-uppercase text-gray-300',
        )}>
        {strings('payment_activities.stk_push.notification_sent')}
      </Text>
      <Markdown
        style={{
          body: applyStyles(
            'pb-12 px-16 text-center text-gray-300 text-400 text-base',
          ),
          textgroup: applyStyles('text-center'),
          em: applyStyles('text-700', {
            fontWeight: '500',
            fontStyle: 'normal',
          }),
        }}>
        {strings('payment_activities.stk_push.confirmation_text', {mobile})}
      </Markdown>
    </View>
    <View
      style={applyStyles('pb-24 px-16 flex-row justify-end pt-16 border-t-1', {
        borderTopColor: colors['gray-20'],
      })}>
      <Button
        onPress={onClose}
        variantColor="blue"
        title={strings('done')}
        style={applyStyles({width: 100})}
      />
    </View>
  </>
);

type MoneyDepositScreenProps = {
  onClose: () => void;
} & ModalWrapperFields;

export const MoneyDepositScreen = withModal(
  ({onClose, closeModal, openModal}: MoneyDepositScreenProps) => {
    const {getWallet} = useWallet();
    const {getCollectionMethods} = useCollectionMethod();
    const wallet = getWallet();
    const collectionMethods = getCollectionMethods();
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

    const virtualAccounts = useMemo(() => {
      return _(collectionMethods)
        .map((collectionMethod) => {
          const bankDetails = parseBankDetails(
            collectionMethod.account_details,
          );
          if (!bankDetails) {
            return null;
          }
          return bankDetails;
        })
        .compact()
        .value();
    }, [collectionMethods, parseBankDetails]);

    const handleSTKPush = useCallback(
      async ({mobile, amount}, setSubmitting) => {
        try {
          setSubmitting(true);
          await getApiService().stkPushDeposit({
            mobile,
            amount: toNumber(amount),
          });
          getAnalyticsService()
            .logEvent('initiateDepositSTKPush', {
              amount: toNumber(amount),
            })
            .then();
          setSubmitting(false);
          openModal('bottom-half', {
            renderContent: () => (
              <STKPushConfirmation
                mobile={mobile}
                onClose={() => {
                  closeModal();
                  onClose();
                }}
              />
            ),
          });
        } catch (error) {
          setSubmitting(false);
          handleError(error);
        }
      },
      [onClose, openModal, closeModal],
    );

    return (
      <View style={as('')}>
        <Header
          title={strings('payment_activities.deposit')}
          style={as('border-b-0 pt-12 pb-0')}
        />
        {wallet?.currency_code !== 'KES' ? (
          <View style={as('items-center px-16 py-12')}>
            <Text style={as('text-center text-sm mb-16 text-gray-200')}>
              {strings('payment_activities.deposit_help_text')}
            </Text>
            <AccountDetailsCard
              label={strings('payment_activities.your_wallet_account_no_is', {
                count: virtualAccounts.length,
              })}
              accountDetailsList={virtualAccounts}
              copyMessage={strings('payment_activities.tap_to_copy')}
            />
            <Button
              onPress={onClose}
              variantColor="clear"
              title={strings('close')}
              style={as('px-64 mt-24 mb-16')}
            />
          </View>
        ) : (
          <STKPushDeposit onClose={onClose} onSubmit={handleSTKPush} />
        )}
      </View>
    );
  },
);
