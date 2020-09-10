import React, {useState, useCallback, useLayoutEffect} from 'react';
import {ScrollView, Text, View, StyleSheet, ToastAndroid} from 'react-native';
import {applyStyles} from '../../../../helpers/utils';
import {
  CurrencyInput,
  FloatingLabelInput,
  Button,
} from '../../../../components';
import {IProduct} from '../../../../models/Product';
import {colors} from '../../../../styles';
import {useRealm} from '../../../../services/realm';
import {updateProduct} from '../../../../services/ProductService';
import {useNavigation} from '@react-navigation/native';
import HeaderRight from '../../../../components/HeaderRight';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '../..';
import {useScreenRecord} from '../../../../services/analytics';
import {Formik, FormikHelpers} from 'formik';
import * as yup from 'yup';

type Payload = Pick<IProduct, 'name' | 'sku' | 'price'>;

const formValidation = yup.object().shape({
  name: yup.string().required('Product name is required'),
  price: yup.string().required('Product price is required'),
});

export const EditProduct = ({
  route,
}: StackScreenProps<MainStackParamList, 'EditProduct'>) => {
  useScreenRecord();
  const realm = useRealm();
  const navigation = useNavigation();
  const {product: productProps} = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const formInitialValues: Payload = {name: '', price: undefined};

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight menuOptions={[]} />,
    });
  }, [navigation]);

  const onSubmit = useCallback(
    (values: Payload, {resetForm}: FormikHelpers<Payload>) => {
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
