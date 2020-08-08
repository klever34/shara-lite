import React, {useState, useCallback, useLayoutEffect} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {applyStyles} from '../../../../helpers/utils';
import {
  CurrencyInput,
  FloatingLabelInput,
  Button,
} from '../../../../components';
import {IProduct} from '../../../../models/Product';
import {colors} from '../../../../styles';
import {useRealm} from '../../../../services/realm';
import {saveProduct} from '../../../../services/ProductService';
import {useNavigation} from '@react-navigation/native';
import HeaderRight from '../../../../components/HeaderRight';

type Payload = Pick<IProduct, 'name' | 'sku' | 'price'>;

export const AddProduct = () => {
  const realm = useRealm();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Payload>({} as Payload);

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
    setTimeout(() => {
      saveProduct({realm, product});
      setIsLoading(false);
      clearForm();
      navigation.goBack();
    }, 300);
  }, [realm, clearForm, product, navigation]);

  return (
    <ScrollView
      style={applyStyles('px-lg', {
        paddingTop: 40,
        backgroundColor: colors.white,
      })}>
      <Text
        style={applyStyles('text-400', {
          fontSize: 18,
          color: colors.primary,
        })}>
        Product Details
      </Text>
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
        title="Add product"
        isLoading={isLoading}
        onPress={handleSubmit}
        style={applyStyles({marginVertical: 48})}
      />
    </ScrollView>
  );
};