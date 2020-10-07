import React, {useState, useCallback, useLayoutEffect} from 'react';
import {ScrollView, Text, View, StyleSheet, ToastAndroid} from 'react-native';
import {applyStyles} from 'app-v1/helpers/utils';
import {
  CurrencyInput,
  FloatingLabelInput,
  Button,
} from '../../../../components';
import {IProduct} from 'app-v1/models/Product';
import {colors} from 'app-v1/styles';
import {useRealm} from 'app-v1/services/realm';
import {updateProduct} from 'app-v1/services/ProductService';
import {useNavigation} from '@react-navigation/native';
import HeaderRight from '../../../../components/HeaderRight';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '../..';
import {Formik} from 'formik';
import * as yup from 'yup';

type Payload = Pick<IProduct, 'name' | 'sku' | 'price'>;

const formValidation = yup.object().shape({
  name: yup.string().required('Product name is required'),
  price: yup.string().required('Product price is required'),
});

export const EditProduct = ({
  route,
}: StackScreenProps<MainStackParamList, 'EditProduct'>) => {
  const realm = useRealm();
  const navigation = useNavigation();
  const {product: productProps} = route.params;
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight menuOptions={[]} />,
    });
  }, [navigation]);

  const onSubmit = useCallback(
    (values: any, {resetForm}: any) => {
      setIsLoading(true);
      updateProduct({realm, product: productProps, updates: values});
      setIsLoading(false);
      resetForm();
      navigation.goBack();
      ToastAndroid.show('Product edited', ToastAndroid.SHORT);
    },
    [realm, productProps, navigation],
  );

  return (
    <ScrollView
      persistentScrollbar={true}
      style={applyStyles('px-lg', {
        paddingTop: 40,
        backgroundColor: colors.white,
      })}
      keyboardShouldPersistTaps="always">
      <Text style={styles.title}>Product Details</Text>
      <Formik
        onSubmit={onSubmit}
        initialValues={{
          name: productProps.name,
          sku: productProps.sku,
          price: productProps.price,
        }}
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

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: 'Rubik-Regular',
  },
});
