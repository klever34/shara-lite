import {AppInput, Text} from '@/components';
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
import {DisbursementProvider} from 'types/app';
import {getI18nService} from '@/services';
import {DisbursementOption} from '@/models/DisbursementMethod';
import {Checkbox} from '@/components/Checkbox';
import {useDisbursementMethod} from '@/services/disbursement-method';
import {sortBy} from 'lodash';
const strings = getI18nService().strings;

type DisbursementFormProps = {
  initialValues?: any;
  hidePicker?: boolean;
  disbursementProviders: DisbursementProvider[];
  onFormSubmit: FormikConfig<DisbursementOption>['onSubmit'];
  renderButtons: (
    handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void,
    values?: DisbursementOption,
  ) => ReactNode;
};
type FormFieldRefs = Partial<Record<string, RefObject<TextInput>>>;

export const DisbursementForm = ({
  onFormSubmit,
  initialValues,
  renderButtons,
  disbursementProviders,
  hidePicker = false,
}: DisbursementFormProps) => {
  const [
    selectedDisbursementProvider,
    setSelectedDisbursementProvider,
  ] = useState<DisbursementProvider | undefined>();
  const {getDisbursementMethods} = useDisbursementMethod();
  const disbursementMethods = getDisbursementMethods();

  const [fieldRefNames, fieldRefs] = useMemo(() => {
    const nextFieldRefs: FormFieldRefs = {};
    const nextFieldRefNames =
      selectedDisbursementProvider?.fields ??
      (initialValues?.fieldsData as DisbursementProvider['fields']);
    nextFieldRefNames?.forEach(({key}) => {
      nextFieldRefs[key] = createRef<TextInput>();
    });
    return [nextFieldRefNames, nextFieldRefs];
  }, [initialValues, selectedDisbursementProvider]);

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
    <Formik<DisbursementOption>
      onSubmit={onFormSubmit}
      initialValues={
        initialValues
          ? initialValues
          : {slug: '', name: '', fieldsData: [], is_primary: false}
      }>
      {({values, setFieldValue, handleSubmit}) => (
        <View style={applyStyles('px-14 py-20')}>
          {!hidePicker && (
            <Picker
              mode="dropdown"
              prompt={strings(
                'payment.withdrawal_method.withdrawal_picker_placeholder',
              )}
              selectedValue={values.slug}
              onValueChange={(itemValue) => {
                setFieldValue('slug', itemValue);
                const selectedProvider = disbursementProviders.find(
                  (item) => item.slug === itemValue,
                );
                const name = selectedProvider?.name;
                const fields = selectedProvider?.fields;

                setFieldValue('name', name);
                setFieldValue('fieldsData', fields);
                setSelectedDisbursementProvider(selectedProvider);
              }}
              style={applyStyles('bg-gray-10 py-16 pl-16 rounded-12')}>
              <Picker.Item
                label={strings(
                  'payment.withdrawal_method.withdrawal_picker_placeholder',
                )}
                value=""
              />
              {disbursementProviders.map((provider) => (
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

            if (!field.type || field.type === 'string') {
              return (
                <AppInput
                  key={field.key}
                  ref={fieldRef}
                  label={field.label}
                  containerStyle={applyStyles('mt-24')}
                  returnKeyType={getReturnKeyType(field.key)}
                  onSubmitEditing={getSubmitEditingHandler(
                    field.key,
                    handleSubmit,
                  )}
                  value={
                    values?.fieldsData ? values?.fieldsData[index]?.value : ''
                  }
                  onChangeText={(text: string) => {
                    const updatedFieldsData = values?.fieldsData?.map(
                      (item) => {
                        if (item.key === field.key) {
                          return {...item, value: text};
                        }
                        return item;
                      },
                    );
                    setFieldValue('fieldsData', updatedFieldsData);
                  }}
                />
              );
            }

            if (field.type === 'dropdown') {
              return (
                <>
                  <Text
                    style={applyStyles(
                      'text-base text-500 text-gray-50 pb-8 flex-1 mt-20',
                    )}>
                    {field.label}
                  </Text>
                  <Picker
                    mode="dropdown"
                    prompt={field.label}
                    selectedValue={
                      values?.fieldsData ? values?.fieldsData[index]?.value : ''
                    }
                    onValueChange={(itemValue) => {
                      const updatedFieldsData = values?.fieldsData?.map(
                        (item) => {
                          if (item.key === field.key) {
                            return {...item, value: itemValue};
                          }
                          return item;
                        },
                      );
                      setFieldValue('fieldsData', updatedFieldsData);
                    }}
                    style={applyStyles('bg-gray-10 py-16 pl-16 rounded-12')}>
                    <Picker.Item
                      label={strings(
                        'payment.withdrawal_method.select_an_option',
                      )}
                      value=""
                    />
                    {sortBy(field.options, 'label').map((option) => (
                      <Picker.Item
                        key={JSON.stringify(option)}
                        label={option.label}
                        value={JSON.stringify(option)}
                      />
                    ))}
                  </Picker>
                </>
              );
            }
          })}

          {!!disbursementMethods.length && !!values.slug && (
            <View
              style={applyStyles(
                'text-base text-400 text-gray-200 mt-14 mx-10',
              )}>
              <Checkbox
                value={values.is_primary}
                onChange={(value) => {
                  if (value) {
                    setFieldValue('is_primary', false);
                  } else {
                    setFieldValue('is_primary', true);
                  }
                }}
                isChecked={!!values.is_primary}
                containerStyle={applyStyles('justify-between mb-2')}
                leftLabel={
                  <Text style={applyStyles('text-400 text-base')}>
                    {strings(
                      'payment.withdrawal_method.make_default_withdrawal',
                    )}
                  </Text>
                }
              />
            </View>
          )}

          {renderButtons(handleSubmit, values)}
        </View>
      )}
    </Formik>
  );
};