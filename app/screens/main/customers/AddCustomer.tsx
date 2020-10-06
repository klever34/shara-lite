import {applyStyles} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {getCustomers, saveCustomer} from '@/services/customer/service';
import {FormDefaults} from '@/services/FormDefaults';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import {useNavigation} from '@react-navigation/native';
import {Formik, FormikHelpers} from 'formik';
import React, {useCallback} from 'react';
import {Alert, ScrollView, StyleSheet, ToastAndroid, View} from 'react-native';
import * as yup from 'yup';
import {Button, FloatingLabelInput} from '../../../components';

type Props = {
  onSubmit?: (customer: ICustomer) => void;
};

type FormValues = {name: string; mobile?: string};

const formValidation = yup.object().shape({
  name: yup.string().required('Customer name is required'),
});

export const AddCustomer = (props: Props) => {
  const {onSubmit} = props;
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const customers = getCustomers({realm});

  const onFormSubmit = useCallback(
    (values: FormValues, {resetForm}: FormikHelpers<FormValues>) => {
      if (customers.map((item) => item.mobile).includes(values.mobile)) {
        Alert.alert(
          'Info',
          'Customer with the same phone number has been created.',
        );
      } else {
        saveCustomer({realm, customer: values});
        onSubmit ? onSubmit(values) : navigation.goBack();
        resetForm();
        ToastAndroid.show('Customer added', ToastAndroid.SHORT);
      }
    },
    [navigation, realm, onSubmit, customers],
  );

  return (
    <ScrollView
      persistentScrollbar={true}
      style={styles.container}
      keyboardShouldPersistTaps="always">
      <Formik
        onSubmit={onFormSubmit}
        validationSchema={formValidation}
        initialValues={{name: ''} || FormDefaults.get('newCustomerMobile', '')}>
        {({
          values,
          errors,
          touched,
          isSubmitting,
          handleChange,
          handleSubmit,
        }) => (
          <View>
            <View style={styles.formInputs}>
              <FloatingLabelInput
                label="Name"
                value={values.name}
                errorMessage={errors.name}
                onChangeText={handleChange('name')}
                containerStyle={applyStyles('mb-xl')}
                isInvalid={touched.name && !!errors.name}
              />
              <FloatingLabelInput
                label="Phone Number (optional)"
                autoCompleteType="tel"
                value={values.mobile}
                keyboardType="phone-pad"
                containerStyle={styles.input}
                onChangeText={handleChange('mobile')}
              />
            </View>
            <Button
              title="Save"
              variantColor="red"
              style={styles.button}
              onPress={handleSubmit}
              isLoading={isSubmitting}
            />
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  formInputs: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 40,
  },
});
