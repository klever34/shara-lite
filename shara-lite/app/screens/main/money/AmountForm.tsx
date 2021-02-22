import React from 'react';
import {as} from '@/styles';
import {
  AppInput,
  Header,
  Text,
  HeaderTitleProps,
  ButtonProps,
} from '@/components';
import {View} from 'react-native';
import {
  TouchableActionItem,
  TouchableActionItemProps,
} from '@/components/TouchableActionItem';
import ActionButtonSet from '@/components/ActionButtonSet';
import {useFormik} from 'formik';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

type AmountFormProps = {
  header: HeaderTitleProps;
  leadText: string;
  actionItems: TouchableActionItemProps[];
  onClose: () => void;
  doneButton: Omit<ButtonProps, 'onPress'> & {
    onPress: (amount: string) => void;
  };
};

export const AmountForm = ({
  header,
  leadText,
  actionItems,
  onClose,
  doneButton,
}: AmountFormProps) => {
  const {values, handleChange} = useFormik({
    initialValues: {
      amount: '',
    },
    onSubmit: () => {},
  });
  return (
    <View style={as('')}>
      <Header {...header} style={as('border-b-0 pt-12 pb-0')} />
      <View style={as('px-24 py-12')}>
        <AppInput
          value={values.amount}
          label={strings('payment_activities.withdraw_fields.amount.label')}
          onChangeText={handleChange('amount')}
          keyboardType="numeric"
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
