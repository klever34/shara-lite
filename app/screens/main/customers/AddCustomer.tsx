import {applyStyles} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {getCustomers, saveCustomer} from '@/services/customer/service';
import {FormDefaults} from '@/services/FormDefaults';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import {useNavigation} from '@react-navigation/native';
import {Formik, FormikHelpers} from 'formik';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
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
  const [isLoading, setIsLoading] = useState(false);

  const onFormSubmit = useCallback(
    (values: FormValues, {resetForm}: FormikHelpers<FormValues>) => {
      if (customers.map((item) => item.mobile).includes(values.mobile)) {
        Alert.alert(
          'Info',
          'Customer with the same phone number has been created.',
        );
      } else {
        saveCustomer({realm, customer: values});
        setIsLoading(true);
        setIsLoading(false);
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
      <Text style={styles.title}>Customer Details</Text>
      <Formik
        onSubmit={onFormSubmit}
        validationSchema={formValidation}
        initialValues={{name: ''} || FormDefaults.get('newCustomerMobile', '')}>
        {({values, errors, touched, handleChange, handleSubmit}) => (
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
              isLoading={isLoading}
              style={styles.button}
              onPress={handleSubmit}
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
    paddingVertical: 40,
    paddingHorizontal: 32,
    backgroundColor: colors.white,
  },
  formInputs: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    paddingBottom: 40,
    color: colors.primary,
    fontFamily: 'Rubik-Regular',
  },
  button: {
    marginBottom: 40,
  },
});
