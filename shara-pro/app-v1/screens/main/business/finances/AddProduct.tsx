import {applyStyles} from 'app-v1/helpers/utils';
import {IProduct} from 'app-v1/models/Product';
import {getAnalyticsService} from 'app-v1/services';
import {useErrorHandler} from 'app-v1/services/error-boundary';
import {FormDefaults} from 'app-v1/services/FormDefaults';
import {saveProduct} from 'app-v1/services/ProductService';
import {useRealm} from 'app-v1/services/realm';
import {colors} from 'app-v1/styles';
import {useNavigation} from '@react-navigation/native';
import {Formik, FormikHelpers} from 'formik';
import React, {useCallback, useLayoutEffect, useState, useMemo} from 'react';
import {ScrollView, Text, ToastAndroid, View} from 'react-native';
import * as yup from 'yup';
import {
  Button,
  CurrencyInput,
  FloatingLabelInput,
} from '../../../../components';
import HeaderRight from '../../../../components/HeaderRight';
// Todo: Translate
import {getI18nService} from '@/services';
const strings = getI18nService().strings;
type Payload = Pick<IProduct, 'name' | 'sku' | 'price'>;

export const AddProduct = () => {
  const formValidation = useMemo(
    () =>
      yup.object().shape({
        name: yup.string().required('Product name is required'),
        price: yup.string().required('Product price is required'),
      }),
    [],
  );
  const realm = useRealm();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const formInitialValues: Payload =
    {
      name: '',
      price: undefined,
    } || FormDefaults.get('newProduct', {});

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
        {strings('product_details')}
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
                label="Product SKU (optional)"
                value={values.sku}
                onChangeText={handleChange('sku')}
              />
            </View>
            <View>
              <View style={applyStyles('flex-row', 'items-center')}>
                <CurrencyInput
                  label={strings('price')}
                  keyboardType="number-pad"
                  errorMessage={errors.price}
                  isInvalid={touched.price && !!errors.price}
                  onChange={(text) => setFieldValue('price', text)}
                  value={values.price ? values.price.toString() : ''}
                />
              </View>
            </View>
            <Button
              title={strings('save')}
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
