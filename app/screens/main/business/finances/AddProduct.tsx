import {applyStyles} from '@/helpers/utils';
import {IProduct} from '@/models/Product';
import {getAnalyticsService} from '@/services';
import {useScreenRecord} from '@/services/analytics';
import {useErrorHandler} from '@/services/error-boundary';
import {saveProduct} from '@/services/ProductService';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import {useNavigation} from '@react-navigation/native';
import {Formik, FormikHelpers} from 'formik';
import * as yup from 'yup';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {ScrollView, Text, ToastAndroid, View} from 'react-native';
import {
  Button,
  CurrencyInput,
  FloatingLabelInput,
} from '../../../../components';
import HeaderRight from '../../../../components/HeaderRight';

type Payload = Pick<IProduct, 'name' | 'sku' | 'price'>;

const formValidation = yup.object().shape({
  name: yup.string().required('Product name is required'),
  price: yup.string().required('Product price is required'),
});

export const AddProduct = () => {
  useScreenRecord();
  const realm = useRealm();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const formInitialValues: Payload = {name: '', price: undefined};

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight menuOptions={[]} />,
    });
  }, [navigation]);

  const handleError = useErrorHandler();

  const onSubmit = useCallback(
    (values, {resetForm}: FormikHelpers<Payload>) => {
      setIsLoading(true);
      setTimeout(() => {
        saveProduct({realm, product: values});
        getAnalyticsService().logEvent('productAdded').catch(handleError);
        setIsLoading(false);
        resetForm();
        navigation.goBack();
        ToastAndroid.show('Product added', ToastAndroid.SHORT);
      }, 300);
    },
    [realm, handleError, navigation],
  );

  return (
    <ScrollView
      style={applyStyles('px-lg', {
        paddingTop: 40,
        backgroundColor: colors.white,
      })}
      persistentScrollbar={true}
      keyboardShouldPersistTaps="always">
      <Text
        style={applyStyles('text-400', {
          fontSize: 18,
          color: colors.primary,
        })}>
        Product Details
      </Text>
      <Formik
        onSubmit={onSubmit}
        initialValues={formInitialValues}
        validationSchema={formValidation}>
        {({
          values,
          errors,
          touched,
          handleSubmit,
          handleChange,
          setFieldValue,
        }) => (
          <>
            <View style={applyStyles('flex-row', 'items-center')}>
              <FloatingLabelInput
                label="Product Name"
                value={values.name}
                errorMessage={errors.name}
                onChangeText={handleChange('name')}
                isInvalid={touched.name && !!errors.name}
              />
            </View>
            <View style={applyStyles('flex-row', 'items-center')}>
              <FloatingLabelInput
                label="Product SKU"
                value={values.sku}
                onChangeText={handleChange('sku')}
              />
            </View>
            <View>
              <View style={applyStyles('flex-row', 'items-center')}>
                <CurrencyInput
                  label="Price"
                  keyboardType="number-pad"
                  errorMessage={errors.price}
                  isInvalid={touched.price && !!errors.price}
                  onChange={(text) => setFieldValue('price', text)}
                  value={values.price ? values.price.toString() : ''}
                />
              </View>
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
  );
};
