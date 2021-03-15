import {Button} from '@/components';
import {
  FlatFloatingLabelCurrencyInput,
  toNumber,
} from '@/components/FloatingLabelCurrencyInput';
import {Icon} from '@/components/Icon';
import {amountWithCurrency} from '@/helpers/utils';
import {getI18nService} from '@/services';
import {useWallet} from '@/services/wallet';
import {applyStyles, colors} from '@/styles';
import {FormikConfig, useFormik} from 'formik';
import React from 'react';
import {Text, View} from 'react-native';
import * as yup from 'yup';

type AddRepaymentModalProps = {
  onClose(): void;
  initialValues?: {amount: string};
  onSubmit: FormikConfig<{amount: string}>['onSubmit'];
};

const strings = getI18nService().strings;

export const AddRepaymentModal = (props: AddRepaymentModalProps) => {
  const {onSubmit, onClose, initialValues} = props;

  const {getWallet} = useWallet();
  const wallet = getWallet();

  const {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    handleSubmit,
  } = useFormik({
    onSubmit,
    initialValues: initialValues ? initialValues : {amount: ''},
    validationSchema: yup.object().shape({
      amount: yup
        .string()
        .required(
          strings('bnpl.record_transaction.fields.total_amount.errorMessage'),
        ),
    }),
  });

  const btnIsDisabled =
    !values.amount || toNumber(values.amount) > (wallet?.balance ?? 0);

  return (
    <View>
      <Text
        style={applyStyles('pt-24 pb-8 text-center text-uppercase text-700')}>
        {strings('bnpl.add_repayment')}
      </Text>
      <Text
        style={applyStyles('pb-24 text-center text-uppercase text-gray-200')}>
        {strings('bnpl.client.wallet_balance', {
          amount: amountWithCurrency(wallet?.balance),
        })}
      </Text>
      <View style={applyStyles('px-24')}>
        <FlatFloatingLabelCurrencyInput
          editable={false}
          errorMessage={errors.amount}
          value={toNumber(values.amount)}
          isInvalid={!!touched.amount && !!errors.amount}
          onChangeText={(value) => setFieldValue('amount', value)}
          label={strings('bnpl.client.repayment.fields.amount.label')}
        />
        <Text
          style={applyStyles('py-24 text-red-100 text-center text-uppercase')}>
          {strings('bnpl.client.add_repayment_note')}
        </Text>

        <View style={applyStyles('flex-row items-center mb-48')}>
          <Icon
            size={24}
            name="comment"
            type="material-icons"
            color={colors['gray-100']}
            style={applyStyles('top-8')}
          />
          <View
            style={applyStyles('border-b-1 flex-1 ml-16 py-18', {
              borderBottomColor: colors['gray-20'],
            })}>
            <Text style={applyStyles('text-black text-xl')}>
              {strings('bnpl.client.repayment_to_shara')}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={applyStyles('p-24 flex-row justify-end border-t-1', {
          borderColor: colors['gray-20'],
        })}>
        <View style={applyStyles('flex-row items-center')}>
          <Button
            onPress={onClose}
            variantColor="clear"
            title={strings('cancel')}
            textStyle={applyStyles('text-secondary text-uppercase')}
            style={applyStyles('mr-16', {width: 120, borderWidth: 0})}
          />
          <Button
            variantColor="blue"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={btnIsDisabled}
            title={strings('confirm')}
            style={applyStyles({width: 120})}
            textStyle={applyStyles('text-uppercase')}
          />
        </View>
      </View>
    </View>
  );
};
