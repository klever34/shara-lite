import {AppInput} from '@/components';
import {IPaymentOption} from '@/models/PaymentOption';
import {applyStyles} from '@/styles';
import {Picker} from '@react-native-community/picker';
import {Formik, FormikConfig} from 'formik';
import React, {
  createRef,
  ReactNode,
  RefObject,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {TextInput, View} from 'react-native';
import {PaymentProvider} from 'types/app';
import {getI18nService} from '@/services';
const strings = getI18nService().strings;

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
type FormFieldRefs = Partial<Record<string, RefObject<TextInput>>>;

export const PaymentForm = ({
  onFormSubmit,
  initialValues,
  renderButtons,
  paymentProviders,
  hidePicker = false,
}: PaymentFormProps) => {
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<
    PaymentProvider | undefined
  >();

  const [fieldRefNames, fieldRefs] = useMemo(() => {
    const nextFieldRefs: FormFieldRefs = {};
    const nextFieldRefNames =
      selectedPaymentProvider?.fields ??
      (initialValues?.fieldsData as PaymentProvider['fields']);
    nextFieldRefNames?.forEach(({key}) => {
      nextFieldRefs[key] = createRef<TextInput>();
    });
    return [nextFieldRefNames, nextFieldRefs];
  }, [initialValues, selectedPaymentProvider]);

  const getReturnKeyType = useCallback(
    (name: string) => {
      const index = fieldRefNames?.findIndex(({key}) => name === key);
      return !fieldRefNames?.length || index === fieldRefNames.length - 1
        ? 'done'
        : 'next';
    },
    [fieldRefNames],
  );

  const getSubmitEditingHandler = useCallback(
    (name: string, runHandleSubmitBtnPress: () => void) => {
      const index = fieldRefNames?.findIndex(({key}) => name === key);
      if (fieldRefNames?.length && index !== undefined) {
        if (index !== fieldRefNames.length - 1) {
          const nextFieldRef = fieldRefs[fieldRefNames[index + 1].key];
          return () => {
            setImmediate(() => {
              if (nextFieldRef?.current) {
                nextFieldRef.current.focus();
              }
            });
          };
        } else if (index === fieldRefNames.length - 1) {
          return runHandleSubmitBtnPress;
        }
      }
    },
    [fieldRefNames, fieldRefs],
  );

  return (
    <Formik<IPaymentOption>
      onSubmit={onFormSubmit}
      initialValues={
        initialValues ? initialValues : {slug: '', name: '', fieldsData: []}
      }>
      {({values, setFieldValue, handleSubmit}) => (
        <View style={applyStyles('px-14 py-20')}>
          {!hidePicker && (
            <Picker
              mode="dropdown"
              prompt={strings('payment.payment_form.label')}
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
                setSelectedPaymentProvider(selectedProvider);
              }}
              style={applyStyles('bg-gray-10 py-16 pl-16 rounded-12')}>
              <Picker.Item
                label={strings('payment.payment_form.label')}
                value=""
              />
              {paymentProviders.map((provider) => (
                <Picker.Item
                  key={provider.slug}
                  label={provider.name}
                  value={provider.slug}
                />
              ))}
            </Picker>
          )}
          {values?.fieldsData?.map((field, index) => {
            let fieldRef = fieldRefs[field.key];
            return (
              <AppInput
                key={field.key}
                ref={fieldRef}
                label={values.slug === 'others' ? undefined : field.label}
                containerStyle={applyStyles('mt-24')}
                returnKeyType={getReturnKeyType(field.key)}
                onSubmitEditing={getSubmitEditingHandler(
                  field.key,
                  handleSubmit,
                )}
                placeholder={
                  values.slug === 'others'
                    ? strings(
                        'payment.payment_container.others_placeholder_text',
                      )
                    : undefined
                }
                style={
                  values.slug === 'others'
                    ? // eslint-disable-next-line react-native/no-inline-styles
                      {height: 150, textAlignVertical: 'top'}
                    : {}
                }
                value={
                  values?.fieldsData ? values?.fieldsData[index]?.value : ''
                }
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
            );
          })}

          {renderButtons(handleSubmit, values)}
        </View>
      )}
    </Formik>
  );
};
