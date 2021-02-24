import {
  ButtonProps,
  CurrencyInput,
  Header,
  HeaderTitleProps,
  Text,
  toNumber,
} from '@/components';
import ActionButtonSet from '@/components/ActionButtonSet';
import {
  TouchableActionItem,
  TouchableActionItemProps,
} from '@/components/TouchableActionItem';
import {getI18nService} from '@/services';
import {as} from '@/styles';
import {useFormik} from 'formik';
import React from 'react';
import {View} from 'react-native';

const strings = getI18nService().strings;

type AmountFormProps = {
  header: HeaderTitleProps;
  leadText: string;
  actionItems: TouchableActionItemProps[];
  onClose: () => void;
  doneButton: Omit<ButtonProps, 'onPress'> & {
    onPress: (amount: string) => void;
  };
  walletBalance: number;
};

export const AmountForm = ({
  header,
  leadText,
  actionItems,
  onClose,
  doneButton,
  walletBalance,
}: AmountFormProps) => {
  const {values, setFieldValue} = useFormik({
    initialValues: {
      amount: '',
    },
    onSubmit: () => {},
  });
  return (
    <View style={as('')}>
      <Header {...header} style={as('border-b-0 pt-12 pb-0')} />
      <View style={as('px-24 py-12')}>
        <CurrencyInput
          value={toNumber(values.amount)}
          label={strings('payment_activities.withdraw_fields.amount.label')}
          onChangeText={(text) => setFieldValue('amount', text)}
          keyboardType="numeric"
          isInvalid={toNumber(values.amount) > walletBalance}
          errorMessage="Withdrawal amount is greater than your wallent balance"
        />
        <Text style={as('self-center mt-8 text-gray-200 text-sm')}>
          {leadText}
        </Text>
        <View style={as('mt-24 mb-32')}>
          {actionItems.map((actionItem) => {
            return (
              <TouchableActionItem
                {...actionItem}
                leftSection={{
                  ...actionItem.leftSection,
                  style: as('flex-col-reverse'),
                }}
                style={as('px-0')}
              />
            );
          })}
        </View>
        <ActionButtonSet
          actionBtns={[
            {
              title: strings('cancel'),
              variantColor: 'clear',
              onPress: onClose,
            },
            {
              ...doneButton,
              disabled:
                !values.amount || toNumber(values.amount) > walletBalance,
              onPress: () => {
                doneButton.onPress?.(values.amount);
              },
            },
          ]}
        />
      </View>
    </View>
  );
};
