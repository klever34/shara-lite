import {ICustomer} from '@/models';
import {getContactService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {applyStyles} from '@/styles';
import {useFormik} from 'formik';
import React, {useCallback, useState, useMemo} from 'react';
import {Text} from '@/components';
import {View} from 'react-native';
import * as yup from 'yup';
import {AppInput} from './AppInput';
import {Button} from './Button';
import {PhoneNumber, PhoneNumberField} from './PhoneNumberField';
import {RadioButton} from './RadioButton';
import {getI18nService} from '@/services';
const strings = getI18nService().strings;

//Todo: Translation
type CustomerFormProps = {
  isLoading?: boolean;
  onCancel?: () => void;
  showEmailField?: boolean;
  initialValues: Partial<ICustomer> & {countryCode?: string};
  onSubmit: (values: Partial<ICustomer>, callback?: () => void) => void;
};

export const CustomerForm = ({
  onSubmit,
  onCancel,
  isLoading,
  initialValues,
  showEmailField = false,
}: CustomerFormProps) => {
  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        name: yup.string().required('Customer name is required'),
      }),
    [],
  );
  const {callingCode} = useIPGeolocation();
  const [saveToPhoneBook, setSaveToPhoneBook] = useState(true);
  const {
    errors,
    values,
    touched,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    validationSchema,
    initialValues: initialValues ?? {
      name: '',
      mobile: '',
      email: '',
      countryCode: callingCode,
    },
    onSubmit: async ({countryCode, ...rest}) => {
      const mobile = rest?.mobile
        ? `+${countryCode}${rest?.mobile}`
        : undefined;
      if (saveToPhoneBook) {
        try {
          await getContactService().addContact({
            givenName: rest?.name ?? '',
            phoneNumbers: [
              {
                label: 'mobile',
                number: mobile ?? '',
              },
            ],
          });
        } catch (error) {
          handleError(error);
        }
      }
      onSubmit({...rest, mobile}, onCancel);
    },
  });

  const onChangeMobile = useCallback(
    (value: PhoneNumber) => {
      setFieldValue('countryCode', value.callingCode);
      setFieldValue('mobile', value.number);
    },
    [setFieldValue],
  );

  const handleSaveToPhoneBookChange = useCallback((checked: boolean) => {
    setSaveToPhoneBook(checked);
  }, []);

  return (
    <View>
      <AppInput
        rightIcon="user"
        value={values.name}
        errorMessage={errors.name}
        onChangeText={handleChange('name')}
        containerStyle={applyStyles('mb-24')}
        isInvalid={touched.name && !!errors.name}
        label={strings('customers.manual_customer_modal.fields.name.label')}
      />
      <PhoneNumberField
        rightIcon="phone"
        placeholder={strings(
          'customers.manual_customer_modal.fields.phone.placeholder',
        )}
        label={strings('customers.manual_customer_modal.fields.phone.label')}
        containerStyle={applyStyles('mb-24')}
        onChangeText={(data) => onChangeMobile(data)}
        value={{
          number: values.mobile ? values.mobile : '',
          callingCode: values.countryCode ? values.countryCode : '',
        }}
      />
      {showEmailField && (
        <AppInput
          rightIcon="mail"
          value={values.email}
          onChangeText={handleChange('email')}
          containerStyle={applyStyles('mb-24')}
          label={strings('customers.manual_customer_modal.fields.email.label')}
        />
      )}
      <RadioButton
        isChecked={saveToPhoneBook}
        onChange={handleSaveToPhoneBookChange}
        containerStyle={applyStyles('mb-24 center')}>
        <Text style={applyStyles('text-400 text-gray-300')}>
          {strings('save_to_phonebook')}
        </Text>
      </RadioButton>
      <View style={applyStyles('flex-row items-center justify-between')}>
        <Button
          title={strings('cancel')}
          variantColor="clear"
          onPress={onCancel}
          style={applyStyles({
            width: '48%',
          })}
        />
        <Button
          title={strings('save')}
          variantColor="red"
          isLoading={isLoading}
          onPress={handleSubmit}
          style={applyStyles({
            width: '48%',
          })}
        />
      </View>
    </View>
  );
};
