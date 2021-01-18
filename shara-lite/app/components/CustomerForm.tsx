import {ICustomer} from '@/models';
import {getContactService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {applyStyles} from '@/styles';
import {useFormik} from 'formik';
import React, {useCallback, useState} from 'react';
import {Text, View} from 'react-native';
import * as yup from 'yup';
import {AppInput} from './AppInput';
import {Button} from './Button';
import {PhoneNumber, PhoneNumberField} from './PhoneNumberField';
import {RadioButton} from './RadioButton';
//Todo: Work on translation
type CustomerFormProps = {
  isLoading?: boolean;
  onCancel?: () => void;
  showEmailField?: boolean;
  initialValues: Partial<ICustomer> & {countryCode?: string};
  onSubmit: (values: Partial<ICustomer>, callback?: () => void) => void;
};

const validationSchema = yup.object().shape({
  name: yup.string().required('Customer name is required'),
});

export const CustomerForm = ({
  onSubmit,
  onCancel,
  isLoading,
  initialValues,
  showEmailField = false,
}: CustomerFormProps) => {
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
        label="Customer name"
        errorMessage={errors.name}
        onChangeText={handleChange('name')}
        containerStyle={applyStyles('mb-24')}
        isInvalid={touched.name && !!errors.name}
      />
      <PhoneNumberField
        rightIcon="phone"
        placeholder="Enter customer number"
        label="Customer Phone number (Optional)"
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
          label="Customer Email (Optional)"
          onChangeText={handleChange('email')}
          containerStyle={applyStyles('mb-24')}
        />
      )}
      <RadioButton
        isChecked={saveToPhoneBook}
        onChange={handleSaveToPhoneBookChange}
        containerStyle={applyStyles('mb-24 center')}>
        <Text style={applyStyles('text-400 text-gray-300')}>
          Save to Phonebook
        </Text>
      </RadioButton>
      <View style={applyStyles('flex-row items-center justify-between')}>
        <Button
          title="Cancel"
          variantColor="clear"
          onPress={onCancel}
          style={applyStyles({
            width: '48%',
          })}
        />
        <Button
          title="Save"
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
