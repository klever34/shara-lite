import React, {useState, useCallback, useLayoutEffect} from 'react';
import {ScrollView, Text, View, ToastAndroid} from 'react-native';
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
import {getAnalyticsService} from '../../../../services';
import {useErrorHandler} from '@/services/error-boundary';
import {useScreenRecord} from '../../../../services/analytics';
import {FormDefaults} from '@/services/FormDefaults';

type Payload = Pick<IProduct, 'name' | 'sku' | 'price'>;

export const AddProduct = () => {
  useScreenRecord();
  const realm = useRealm();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Payload>(
    FormDefaults.get('newProduct', {}) as Payload,
  );

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
  const handleError = useErrorHandler();

  const handleSubmit = useCallback(() => {
    if (Object.values(product).length === 3) {
      setIsLoading(true);
      setTimeout(() => {
        saveProduct({realm, product});
        getAnalyticsService().logEvent('productAdded').catch(handleError);
        setIsLoading(false);
        clearForm();
        navigation.goBack();
        ToastAndroid.show('Product added', ToastAndroid.SHORT);
      }, 300);
    }
  }, [product, realm, handleError, clearForm, navigation]);

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
