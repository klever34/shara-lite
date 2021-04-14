import {Button, toNumber} from '@/components';
import { Checkbox } from '@/components/Checkbox';
import {FlatFloatingLabelCurrencyInput} from '@/components/FloatingLabelCurrencyInput';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {getAnalyticsService, getApiService, getI18nService} from '@/services';
import {useBNPLApproval} from '@/services/bnpl-approval';
import { useBNPLDrawdown } from '@/services/bnpl-drawdown';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {useWallet} from '@/services/wallet';
import {applyStyles, colors} from '@/styles';
import { RouteProp } from '@react-navigation/core';
import {addWeeks, format, parseISO} from 'date-fns';
import {useFormik} from 'formik';
import { orderBy } from 'lodash';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  InteractionManager,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { BNPLBundle } from 'types/app';
import { MainStackParamList } from '..';
import { BNPLProduct } from './BNPLProduct';
import {ConfirmationModal} from './ConfirmationModal';

type FormValues = {
  amount_paid: string;
  total_amount: string;
  note: string;
  bearingFees?: boolean;
};

type BNPLRecordTransactionScreenProps = ModalWrapperFields & {
  route: RouteProp<MainStackParamList, 'BNPLRecordTransactionScreen'>;
};

const strings = getI18nService().strings;

export const BNPLRecordTransactionScreen = withModal((props: BNPLRecordTransactionScreenProps) => {
  const {openModal, closeModal, route} = props;
  const {customer} = route.params;
  const {getWallet} = useWallet();
  const navigation = useAppNavigation();
  const {saveTransaction} = useTransaction();
  const {getBNPLApproval} = useBNPLApproval();
  const {saveBNPLDrawdown} = useBNPLDrawdown();

  const wallet = getWallet();
  const {amount_available} =
    getBNPLApproval() ?? {};

    const [bnplBundles, setBNPLBundles] = useState<BNPLBundle[] | undefined>();

  const handleValidateForm = useCallback((values) => {
    const errors = {} as {total_amount: string;};
    if (!values.total_amount) {
      errors.total_amount = strings(
        'bnpl.record_transaction.fields.total_amount.errorMessage',
      );
    } else if (
      wallet?.currency_code === 'KES' &&
      values.total_amount.includes('.')
    ) {
      errors.total_amount = strings('payment_activities.no_decimals');
    } else if (toNumber(values.total_amount) > (amount_available ?? 0)) {
      errors.total_amount = strings(
        'bnpl.record_transaction.excess_amount_error',
      );
    }
    return errors;
  }, []);

  const {
    values,
    errors,
    touched,
    handleSubmit,
    setFieldValue,
  } = useFormik<FormValues>({
    onSubmit: (values) => {
      const {total_amount, amount_paid, ...rest} = values;
      handleOpenConfirmModal({
        ...rest,
        customer,
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
      bearingFees: false,
    },
    validate: handleValidateForm,
  });
  const credit_amount = useMemo(() => {
    return toNumber(values.total_amount) - toNumber(values.amount_paid || '0');
  }, [values.total_amount, values.amount_paid]);

  const bnplProducts = useMemo(() => bnplBundles?.map(item => {
    const amountToPay = 
      (((item.interest_rate ?? 0) * (item.payment_frequency ?? 0)) / 100) * credit_amount +
      credit_amount;

    const total_amount = values.bearingFees ? credit_amount : amountToPay;
    const merchant_amount = credit_amount / ((((item.interest_rate ?? 0) * (item.payment_frequency ?? 0)) + 100) / 100);

    return {
      ...item,
      total_amount,
      merchant_amount,
      payment_frequency_amount: total_amount / (item.payment_frequency ?? 0)
    }
  }), [
    credit_amount, 
    values.bearingFees,
    bnplBundles?.length, 
  ]);

  const [selectedBNPLProduct, setSelectedBNPLProduct] = useState<BNPLBundle | undefined>();

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
      bearingFees: boolean;
    }) => {
      try {
        const {credit_amount, bearingFees } = values;
        const receipt = await saveTransaction({
          ...values,
          is_collection: false,
        });

        const {data} = await getApiService().saveBNPLDrawdown({
          amount: credit_amount,
          receipt_id: `${receipt?._id}`,
          customer_id: `${customer?._id}`,
          bnpl_bundle_id: selectedBNPLProduct?.id,
          takes_charge: bearingFees ? 'merchant' : 'client',
          customer_data: {
            _id: customer?._id,
            name: customer?.name ?? '',
            mobile: customer?.mobile,
            email: customer?.email,
            image: customer?.image,
            _partition: customer?._partition,
            created_at: customer?.created_at,
            is_deleted: customer?.is_deleted,
            updated_at: customer?.updated_at,
            disable_reminders: customer?.disable_reminders,
          },
          receipt_data: {
            tax: receipt.tax,
            _id: receipt?._id,
            note: receipt.note,
            _partition: receipt._partition,
            amount_paid: receipt.amount_paid,
            updated_at: receipt?.updated_at,
            created_at: receipt?.created_at,
            is_cancelled: receipt.is_cancelled,
            is_deleted: receipt.is_deleted,
            total_amount: receipt.total_amount,
            is_collection: receipt.is_collection,
            credit_amount: receipt.credit_amount,
            customer_name: receipt.customer_name,
            customer_mobile: receipt.customer_mobile,
            is_hidden_in_pro: receipt.is_hidden_in_pro,
            transaction_date: receipt.transaction_date,
            //@ts-ignore
            customer: receipt?.customer?._id?.toString() ?? '',
          },
        });
        const {approval, repayments, drawdown} = data;
        closeModal();
        getAnalyticsService()
          .logEvent('takeBNPLDrawdown', {
            amount: values.total_amount,
            receipt_id: receipt?._id?.toString() ?? '',
            repayment_amount: drawdown.repayment_amount,
          })
          .then();
          
        await saveBNPLDrawdown({bnplDrawdown: {
            ...drawdown,
            _partition: drawdown._partition.toString(),
            created_at: parseISO(`${drawdown.created_at}Z`),
            updated_at: parseISO(`${drawdown.updated_at}Z`),
          }
        });
        navigation.navigate('BNPLTransactionSuccessScreen', {
          transaction: {
            approval,
            drawdown,
            repayments,
            receiptData: receipt,
          },
          onDone: handleDone,
        });
      } catch (error) {
        handleError(error);
      }
    },
    [handleDone, navigation, selectedBNPLProduct],
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

  const handleMerchantTermChange = useCallback(() => {
    if (values.bearingFees) {
      setFieldValue('bearingFees',false);
    } else {
      setFieldValue('bearingFees',true);
    }
  }, [values.bearingFees]);

  const handleBNPLProductChange = useCallback((product: any) => {
    setSelectedBNPLProduct(product)
  }, []);
  
  useEffect(() => {
    const fetchBNPLBundles = async () => {
      try {
        const data  = await getApiService().getBNPLBundles();
        const orderedData = orderBy(data, 'payment_frequency', 'desc');
        setBNPLBundles(orderedData);
      } catch (error) {
        handleError(error);
      }
    }
    fetchBNPLBundles();
  }, [])

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
              autoFocus
              errorMessage={errors.total_amount}
              value={toNumber(values.total_amount)}
              label={strings(
                'bnpl.record_transaction.fields.total_amount.label',
              )}
              flatContainerStyle={applyStyles('bg-white')}
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
              flatContainerStyle={applyStyles('bg-white')}
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
      {!!values.total_amount && 
        <ScrollView
          persistentScrollbar
          keyboardShouldPersistTaps="always">
          <View style={applyStyles('px-24')}>
            <Checkbox
              value=""
              checkedColor="bg-blue-100"
              borderColor={colors['blue-100']}
              isChecked={values.bearingFees}
              onChange={handleMerchantTermChange}
              containerStyle={applyStyles('center pt-16 pb-24')}
              rightLabel={
                <View style={applyStyles('pl-24')}>
                  <Text style={applyStyles('text-400 text-gray-200 text-lg')}>
                    {strings('bnpl.record_transaction.bearing_fees_text')}
                  </Text>
                </View>
              }
            />
            <View style={applyStyles('center pb-16')}>
              <Text style={applyStyles('text-400 text-gray-100 text-uppercase')}>
                {strings('bnpl.record_transaction.select_option_text')}
              </Text>
            </View>
            {
              bnplProducts?.map((product, index) => (
                <BNPLProduct 
                  {...product} 
                  key={index.toString()}
                  isMerchant={values.bearingFees}
                  onPress={() => handleBNPLProductChange(product)}
                  isSelected={selectedBNPLProduct?.id === product.id}
                />
              ))
            }
            <Text style={applyStyles('pt-8 text-red-100 text-center text-uppercase', {paddingBottom: 100})}>
              {strings('bnpl.record_transaction.repayment_date', {
                date: format(addWeeks(new Date(), selectedBNPLProduct?.payment_frequency ?? 1), 'dd MMM, yyyy'),
              })}
            </Text>
          </View>
        </ScrollView>
      }
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
            title={strings('next')}
            style={applyStyles({width: 120})}
            textStyle={applyStyles('text-uppercase')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
});
