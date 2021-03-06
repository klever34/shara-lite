import {applyStyles} from 'app-v1/helpers/utils';
import {ISupplier} from 'app-v1/models/Supplier';
import {FormDefaults} from 'app-v1/services/FormDefaults';
import {useRealm} from 'app-v1/services/realm';
import {getSuppliers, saveSupplier} from 'app-v1/services/SupplierService';
import {colors} from 'app-v1/styles';
import {useNavigation} from '@react-navigation/native';
import {Formik, FormikHelpers} from 'formik';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {Alert, ScrollView, Text, ToastAndroid, View} from 'react-native';
import * as yup from 'yup';
import {Button, FloatingLabelInput} from '../../../../components';
import HeaderRight from '../../../../components/HeaderRight';

type Payload = Pick<ISupplier, 'name' | 'mobile' | 'address'>;

const formValidation = yup.object().shape({
  name: yup.string().required('Supplier name is required'),
});

export const AddSupplier = () => {
  const realm = useRealm();
  const navigation = useNavigation();
  const suppliers = getSuppliers({realm});
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  const onFormSubmit = useCallback(
    (values: Payload, {resetForm}: FormikHelpers<Payload>) => {
      if (suppliers.map((item) => item.mobile).includes(values.mobile)) {
        Alert.alert(
          'Error',
          'Supplier with the same phone number has been created.',
        );
      } else {
        setIsLoading(true);
        saveSupplier({realm, supplier: values});
        setIsLoading(false);
        resetForm();
        navigation.goBack();
        ToastAndroid.show('Supplier added', ToastAndroid.SHORT);
      }
    },
    [realm, suppliers, navigation],
  );

  return (
    <View
      style={applyStyles('flex-1', {
        backgroundColor: colors.white,
      })}>
      <ScrollView
        persistentScrollbar={true}
        style={applyStyles('px-lg', {paddingTop: 48})}
        keyboardShouldPersistTaps="always">
        <Text
          style={applyStyles('text-400', {
            fontSize: 18,
            color: colors.primary,
          })}>
          Supplier Details
        </Text>
        <Formik
          onSubmit={onFormSubmit}
          initialValues={{name: ''} || FormDefaults.get('supplier', {})}
          validationSchema={formValidation}>
          {({values, errors, touched, handleChange, handleSubmit}) => (
            <>
              <View style={applyStyles('flex-row', 'items-center')}>
                <FloatingLabelInput
                  label="Name"
                  value={values.name}
                  errorMessage={errors.name}
                  onChangeText={handleChange('name')}
                  isInvalid={touched.name && !!errors.name}
                />
              </View>
              <View style={applyStyles('flex-row', 'items-center')}>
                <FloatingLabelInput
                  label="Address (optional)"
                  value={values.address}
                  onChangeText={handleChange('address')}
                />
              </View>
              <View style={applyStyles('flex-row', 'items-center')}>
                <FloatingLabelInput
                  value={values.mobile}
                  keyboardType="phone-pad"
                  label="Phone number (optional)"
                  onChangeText={handleChange('mobile')}
                />
              </View>
              <Button
                title="Save"
                isLoading={isLoading}
                onPress={handleSubmit}
                style={applyStyles({marginVertical: 48})}
              />
            </>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};
