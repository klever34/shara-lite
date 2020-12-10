import {AppInput} from '@/components';
import {IPaymentOption} from '@/models/PaymentOption';
import {applyStyles} from '@/styles';
import {Picker} from '@react-native-community/picker';
import {Formik, FormikConfig} from 'formik';
import React, {ReactNode} from 'react';
import {View} from 'react-native';
import {PaymentProvider} from 'types/app';

type PaymentFormProps = {
  initialValues?: any;
  hidePicker?: boolean;
  paymentProviders: PaymentProvider[];
  onFormSubmit: FormikConfig<IPaymentOption>['onSubmit'];
  renderButtons: (
    handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void,
    values?: IPaymentOption,
  ) => ReactNode;
};

export const PaymentForm = ({
  onFormSubmit,
  initialValues,
  renderButtons,
  paymentProviders,
  hidePicker = false,
}: PaymentFormProps) => {
  return (
    <Formik<IPaymentOption>
      onSubmit={onFormSubmit}
      initialValues={
        initialValues ? initialValues : {slug: '', name: '', fieldsData: []}
      }>
      {({values, setFieldValue, handleSubmit}) => (
        <View style={applyStyles('px-16 py-24')}>
          {!hidePicker && (
            <Picker
              mode="dropdown"
              prompt="Select a payment method"
              selectedValue={values.slug}
              onValueChange={(itemValue) => {
                setFieldValue('slug', itemValue);
                const selectedProvider = paymentProviders.find(
                  (item) => item.slug === itemValue,
                );
                const name = selectedProvider?.name;
                const fields = selectedProvider?.fields;

                setFieldValue('name', name);
                setFieldValue('fieldsData', fields);
              }}
              style={applyStyles('bg-gray-10 py-16 pl-16 rounded-12')}>
              <Picker.Item label="Select a payment method" value="" />
              {paymentProviders.map((provider) => (
                <Picker.Item
                  key={provider.slug}
                  label={provider.name}
                  value={provider.slug}
                />
              ))}
            </Picker>
          )}
          {values?.fieldsData?.map((field, index) => (
            <AppInput
              key={field.key}
              label={field.label}
              containerStyle={applyStyles('mt-24')}
              value={values?.fieldsData ? values?.fieldsData[index]?.value : ''}
              onChangeText={(text: string) => {
                const updatedFieldsData = values?.fieldsData?.map((item) => {
                  if (item.key === field.key) {
                    return {...item, value: text};
                  }
                  return item;
                });
                setFieldValue('fieldsData', updatedFieldsData);
              }}
            />
          ))}

          {renderButtons(handleSubmit, values)}
        </View>
      )}
    </Formik>
  );
};
