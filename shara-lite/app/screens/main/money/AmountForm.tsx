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
import React, {useCallback, useMemo} from 'react';
import {View, TextInput, KeyboardAvoidingView, Platform} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const strings = getI18nService().strings;

type AmountFormProps = {
  header: HeaderTitleProps;
  leadText: string;
  actionItems: TouchableActionItemProps[];
  onClose: () => void;
  doneButton: Omit<ButtonProps, 'onPress'> & {
    onPress: (amount: string) => void;
  };
  maxAmount?: number;
  onCurrencyInputChange?(value: string): void;
  validateFn?: (values: {amount: string}) => {amount: string};
};

export const AmountForm = ({
  header,
  leadText,
  onClose,
  maxAmount,
  validateFn,
  doneButton,
  actionItems,
  onCurrencyInputChange,
}: AmountFormProps) => {
  const {values, touched, errors, handleSubmit, setFieldValue} = useFormik({
    initialValues: {
      amount: '',
    },
    validate: validateFn,
    onSubmit: (values) => doneButton.onPress(values.amount),
  });
  const handleChange = useCallback(
    (text: string) => {
      setFieldValue('amount', text);
      onCurrencyInputChange?.(text);
    },
    [setFieldValue, onCurrencyInputChange],
  );
  return (
    // <KeyboardAvoidingView
    // behavior={Platform.OS == 'ios' ? 'position' : 'height'}
    // >
    // <ScrollView >
    //   <Text>jkjkjkjkjk</Text>
    //   <Text>jkjkjkjkjk</Text>
    //   <Text>jkjkjkjkjk</Text>
    //   <Text>jkjkjkjkjk</Text>
    //   <TextInput placeholder={"jkjkjkjkj"} />
    //   <Text>jkjkjkjkjk</Text>
    //   <Text>jkjkjkjkjk</Text>
    //   <Text>jkjkjkjkjk</Text>
    //   <Text>jkjkjkjkjk</Text>
    //   <Text>jkjkjkjkjk</Text>
    //   <Text>jkjkjkjkjk</Text>
    //   <Text>jkjkjkjkjk</Text>
    //   <Text>jkjkjkjkjk</Text>
    //   <Text>jkjkjkjkjk</Text>
    //   <Text>jkjkjkjkjk</Text>
    // </ScrollView>
    // </KeyboardAvoidingView>
    <View style={as('')}>
      <Header {...header} style={as('border-b-0 pt-5 pb-0')} />
      <View style={as('px-24 py-24')}>
        <CurrencyInput
          value={toNumber(values.amount)}
          label={strings('payment_activities.withdraw_fields.amount.label')}
          onChangeText={handleChange}
          keyboardType="numeric"
          isInvalid={!!touched.amount && !!errors.amount}
          errorMessage={errors.amount}
        />
        <Text style={as('self-center mt-8 text-gray-200 text-sm')}>
          {leadText}
        </Text>
        <View style={as('mt-24 mb-32')}>
          {actionItems.map((actionItem, index) => {
            return (
              <TouchableActionItem
                {...actionItem}
                leftSection={{
                  ...actionItem.leftSection,
                  style: as('flex-col-reverse'),
                }}
                key={`${index}`}
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
                !values.amount ||
                (!!maxAmount && toNumber(values.amount) > maxAmount),
              onPress: handleSubmit,
            },
          ]}
        />
      </View>
    </View>
  );
};
