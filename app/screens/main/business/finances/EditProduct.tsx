import React, {useState, useCallback, useLayoutEffect} from 'react';
import {ScrollView, Text, View, StyleSheet, ToastAndroid} from 'react-native';
import {applyStyles} from '../../../../helpers/utils';
import {
  CurrencyInput,
  FloatingLabelInput,
  Button,
} from '../../../../components';
import omit from 'lodash/omit';
import {IProduct} from '../../../../models/Product';
import {colors} from '../../../../styles';
import {useRealm} from '../../../../services/realm';
import {updateProduct} from '../../../../services/ProductService';
import {useNavigation} from '@react-navigation/native';
import HeaderRight from '../../../../components/HeaderRight';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '../..';
import {useScreenRecord} from '../../../../services/analytics';

type Payload = Pick<IProduct, 'name' | 'sku' | 'price'>;

export const EditProduct = ({
  route,
}: StackScreenProps<MainStackParamList, 'EditProduct'>) => {
  useScreenRecord();
  const realm = useRealm();
  const navigation = useNavigation();
  const {product: productProps} = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Payload>(omit(productProps, []));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight menuOptions={[]} />,
    });
  }, [navigation]);

  const handleChange = useCallback(
    (value: string | number, key: keyof Payload) => {
      setProduct({
        ...product,
        [key]: value,
      });
    },
    [product],
  );

  const clearForm = useCallback(() => {
    setProduct({} as Payload);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsLoading(true);
    updateProduct({realm, product: productProps, updates: product});
    setIsLoading(false);
    clearForm();
    navigation.goBack();
    ToastAndroid.show('Product edited', ToastAndroid.SHORT);
  }, [realm, clearForm, productProps, product, navigation]);

  return (
    <ScrollView
      persistentScrollbar={true}
      style={applyStyles('px-lg', {
        paddingTop: 40,
        backgroundColor: colors.white,
      })}
      keyboardShouldPersistTaps="always">
      <Text style={styles.title}>Product Details</Text>
      <View style={applyStyles('flex-row', 'items-center')}>
        <FloatingLabelInput
          label="Product Name"
          value={product.name}
          onChangeText={(text) => handleChange(text, 'name')}
        />
      </View>
      <View style={applyStyles('flex-row', 'items-center')}>
        <FloatingLabelInput
          label="Product SKU"
          value={product.sku}
          onChangeText={(text) => handleChange(text, 'sku')}
        />
      </View>
      <View>
        <View style={applyStyles('flex-row', 'items-center')}>
          <CurrencyInput
            label="Price"
            keyboardType="number-pad"
            onChange={(text) => handleChange(text, 'price')}
            value={product.price ? product.price.toString() : ''}
          />
        </View>
      </View>
      <Button
        title="Save"
        isLoading={isLoading}
        onPress={handleSubmit}
        style={applyStyles({marginVertical: 48})}
      />
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
