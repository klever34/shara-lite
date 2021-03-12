import {Button, FloatingLabelInput, toNumber} from '@/components';
import {FlatFloatingLabelCurrencyInput} from '@/components/FloatingLabelCurrencyInput';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {getApiService, getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import {addWeeks, format} from 'date-fns';
import {useFormik} from 'formik';
import * as yup from 'yup';
import React, {useCallback, useMemo} from 'react';
import {
  InteractionManager,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {withModal} from '@/helpers/hocs';
import {ConfirmationModal} from './ConfirmationModal';
import {useTransaction} from '@/services/transaction';
import {handleError} from '@/services/error-boundary';
import {useBNPLApproval} from '@/services/bnpl-approval';

type FormValues = {
  amount_paid: string;
  total_amount: string;
  note: string;
  customer?: ICustomer;
};

const strings = getI18nService().strings;

export const BNPLRecordTransactionScreen = withModal((props) => {
  const {openModal, closeModal} = props;
  const navigation = useAppNavigation();
  const {saveTransaction} = useTransaction();
  const {getBNPLApproval} = useBNPLApproval();
  const {interest_rate, payment_frequency} = getBNPLApproval() ?? {};

  const {
    values,
    errors,
    touched,
    handleSubmit,
    handleChange,
    setFieldValue,
  } = useFormik<FormValues>({
    onSubmit: (values) => {
      const {total_amount, amount_paid, ...rest} = values;
      handleOpenConfirmModal({
        ...rest,
        total_amount: toNumber(total_amount),
        amount_paid: toNumber(amount_paid || '0'),
        credit_amount:
          toNumber(values.total_amount) - toNumber(values.amount_paid || '0'),
      });
    },
    initialValues: {
      note: '',
      amount_paid: '',
      total_amount: '',
      customer: undefined,
    },
    validationSchema: yup.object().shape({
      total_amount: yup
        .string()
        .required(
          strings('bnpl.record_transaction.fields.total_amount.errorMessage'),
        ),
      customer: yup
        .object()
        .required(
          strings('bnpl.record_transaction.fields.customer.errorMessage'),
        ),
    }),
  });
  const credit_amount = useMemo(() => {
    return toNumber(values.total_amount) - toNumber(values.amount_paid || '0');
  }, [values.total_amount, values.amount_paid]);

  const amountToPay =
    (((interest_rate ?? 0) * (payment_frequency ?? 0)) / 100) * credit_amount +
    credit_amount;

  const amountToPayPerWeek = amountToPay / (payment_frequency ?? 0);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleAddCustomer = useCallback(
    (customer: ICustomer) => {
      setFieldValue('customer', customer);
      navigation.navigate('BNPLRecordTransactionScreen');
    },
    [navigation, setFieldValue],
  );

  const handleOpenSelectCustomer = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate('SelectCustomerList', {
        onSelectCustomer: handleAddCustomer,
      });
    });
  }, [handleAddCustomer, navigation]);

  const handleDone = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate('BNPLScreen');
    });
  }, [navigation]);

  const handleSaveTransaction = useCallback(
    async (values: {
      credit_amount: number;
      amount_paid: number;
      total_amount: number;
      customer?: ICustomer;
    }) => {
      try {
        const {customer, credit_amount} = values;
        const transaction = await saveTransaction({
          ...values,
          is_collection: false,
        });
        const response = await getApiService().saveBNPLDrawdown({
          amount: credit_amount,
          customer_id: `${customer?._id}`,
          receipt_id: `${transaction?._id}`,
        });
        console.log(response);
        navigation.navigate('BNPLTransactionSuccessScreen', {
          transaction: values,
          onDone: handleDone,
        });
      } catch (error) {
        handleError(error);
      }
    },
    [handleDone, navigation],
  );

  const handleOpenConfirmModal = useCallback(
    (values) => {
      openModal('bottom-half', {
        renderContent: () => (
          <ConfirmationModal
            onClose={closeModal}
            onSubmit={() => handleSaveTransaction(values)}
          />
        ),
      });
    },
    [closeModal, handleSaveTransaction, openModal],
  );

  return (
    <SafeAreaView style={applyStyles('bg-white flex-1')}>
      <View style={applyStyles('pt-16 pb-32 px-24 bg-primary')}>
        <View style={applyStyles('pb-24 flex-row items-center')}>
          <Touchable onPress={handleGoBack}>
            <View style={applyStyles('w-40 h-40 rounded-32 center')}>
              <Icon
                size={24}
                name="close"
                color={colors.white}
                type="material-community-icons"
              />
            </View>
          </Touchable>
          <Text style={applyStyles('pl-16 text-white text-700 text-xl')}>
            {strings('bnpl.record_transaction.title')}
          </Text>
        </View>
        <View style={applyStyles('flex-row items-center justify-between')}>
          <View style={applyStyles({width: '48%'})}>
            <FlatFloatingLabelCurrencyInput
              errorMessage={errors.total_amount}
              value={toNumber(values.total_amount)}
              label={strings(
                'bnpl.record_transaction.fields.total_amount.label',
              )}
              isInvalid={!!touched.total_amount && !!errors.total_amount}
              onChangeText={(value) => setFieldValue('total_amount', value)}
            />
          </View>
          <View style={applyStyles({width: '48%'})}>
            <FlatFloatingLabelCurrencyInput
              errorMessage={errors.amount_paid}
              value={toNumber(values.amount_paid)}
              label={strings(
                'bnpl.record_transaction.fields.amount_paid.label',
              )}
              isInvalid={!!touched.amount_paid && !!errors.amount_paid}
              onChangeText={(value) => setFieldValue('amount_paid', value)}
            />
          </View>
        </View>
      </View>
      <View style={applyStyles('bg-gray-10 py-16 px-24')}>
        <View style={applyStyles('flex-row items-center justify-between')}>
          <Text style={applyStyles('text-gray-300')}>
            {strings('bnpl.record_transaction.balance')}
          </Text>
          <Text style={applyStyles('text-red-100 text-700')}>
            {amountWithCurrency(credit_amount)}
          </Text>
        </View>
      </View>
      <ScrollView
        persistentScrollbar
        keyboardShouldPersistTaps="always"
        contentContainerStyle={
          !values.total_amount ? applyStyles('flex-1') : undefined
        }>
        <View style={applyStyles('px-24')}>
          {!!values.total_amount && (
            <>
              <Text
                style={applyStyles(
                  'py-24 text-gray-100 text-center text-uppercase',
                )}>
                {strings('bnpl.record_transaction.bnpl_terms_text')}
              </Text>
              <View
                style={applyStyles(
                  'p-16 flex-row items-center justify-between border-t-1 border-b-1',
                  {
                    borderColor: colors['gray-20'],
                  },
                )}>
                <View style={applyStyles({width: '48%'})}>
                  <Text style={applyStyles('pb-8 text-gray-300 text-2xl')}>
                    {amountWithCurrency(amountToPay)}
                  </Text>
                  <Text style={applyStyles('text-gray-100')}>
                    {strings('bnpl.repayment_per_week', {
                      amount: amountWithCurrency(amountToPayPerWeek),
                    })}
                  </Text>
                </View>
                <View style={applyStyles({width: '48%'})}>
                  <Text
                    style={applyStyles(
                      'pb-8 text-right text-gray-300 text-2xl',
                    )}>
                    {strings('bnpl.day_text.other', {
                      amount: (payment_frequency ?? 0) * 7,
                    })}
                  </Text>
                  <Text style={applyStyles('text-right text-gray-100')}>
                    {strings('bnpl.payment_left_text.other', {
                      amount: payment_frequency,
                    })}
                  </Text>
                </View>
              </View>
              <Text
                style={applyStyles(
                  'pt-24 pb-8 text-red-100 text-center text-uppercase',
                )}>
                {strings('bnpl.record_transaction.repayment_date', {
                  date: format(addWeeks(new Date(), 8), 'dd MMM, yyyy'),
                })}
              </Text>
            </>
          )}
          <View style={applyStyles('pb-24 flex-row items-center')}>
            <Icon
              size={20}
              name="comment"
              style={applyStyles('top-8')}
              type="material-icons"
              color={colors['gray-100']}
            />
            <FloatingLabelInput
              value={values.note}
              errorMessage={errors.note}
              onChangeText={handleChange('note')}
              isInvalid={!!errors.note && !!touched.note}
              containerStyle={applyStyles('ml-16 flex-1')}
              label={strings('bnpl.record_transaction.fields.note.label')}
            />
          </View>
          <View style={applyStyles('flex-row items-center')}>
            <Icon
              size={24}
              name="account"
              color={colors['gray-100']}
              style={applyStyles('top-8')}
              type="material-community-icons"
            />
            <Touchable onPress={handleOpenSelectCustomer}>
              <View
                style={applyStyles('border-b-1 flex-1 ml-16 py-18', {
                  borderBottomColor: colors['gray-20'],
                })}>
                {values.customer ? (
                  <Text style={applyStyles('text-black text-700 text-xl')}>
                    {values.customer.name}
                  </Text>
                ) : (
                  <Text style={applyStyles('text-gray-50 text-xl')}>
                    {strings(
                      'bnpl.record_transaction.fields.customer.placeholder',
                    )}
                  </Text>
                )}
              </View>
            </Touchable>
          </View>
          {!!touched.customer && !!errors.customer && (
            <Text
              style={applyStyles('pt-8 text-red-200', {
                fontSize: 12,
                color: colors['red-200'],
              })}>
              {errors.customer}
            </Text>
          )}
        </View>
        <View
          style={applyStyles(
            `bg-white mt-32 px-24 py-8 flex-row justify-end border-t-1 ${
              !values.total_amount && 'bottom-0 absolute w-full'
            }`,
            {
              borderColor: colors['gray-20'],
            },
          )}>
          <View style={applyStyles('flex-row items-center')}>
            <Button
              variantColor="clear"
              onPress={handleGoBack}
              title={strings('cancel')}
              textStyle={applyStyles('text-secondary text-uppercase')}
              style={applyStyles('mr-16', {width: 120, borderWidth: 0})}
            />
            <Button
              variantColor="blue"
              onPress={handleSubmit}
              title={strings('save')}
              style={applyStyles({width: 120})}
              textStyle={applyStyles('text-uppercase')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});
