import React, {useState, useCallback, useLayoutEffect} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {applyStyles} from '../../../../helpers/utils';
import {colors} from '../../../../styles';
import {FloatingLabelInput, Button} from '../../../../components';
import {useRealm} from '../../../../services/realm';
import {useNavigation} from '@react-navigation/native';
import HeaderRight from '../../../../components/HeaderRight';

type Payload = Pick<IProduct, 'name' | 'sku' | 'price'>;

export const AddSupplier = () => {
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
        Supplier Details
      </Text>
      <View style={applyStyles('flex-row', 'items-center')}>
        <FloatingLabelInput
          label="Name"
          value={product.name}
          onChangeText={(text) => handleChange(text, 'name')}
        />
      </View>
      <View style={applyStyles('flex-row', 'items-center')}>
        <FloatingLabelInput
          label="Address"
          value={product.address}
          onChangeText={(text) => handleChange(text, 'sku')}
        />
      </View>
      <View style={applyStyles('flex-row', 'items-center')}>
        <FloatingLabelInput
          label="Phone number"
          value={product.mobile}
          keyboardType="number-pad"
          onChangeText={(text) => handleChange(text, 'sku')}
        />
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
