import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {Button} from '../../../../components';
import React, {useState, useCallback, useLayoutEffect} from 'react';
import {ScrollView, Text, View, Alert} from 'react-native';
import HeaderRight from '../../../../components/HeaderRight';
import {applyStyles, numberWithCommas} from '../../../../helpers/utils';
import {colors} from '../../../../styles';
import {MainStackParamList} from '../../index';
import {getProduct, deleteProduct} from '../../../../services/ProductService';
import {useRealm} from '../../../../services/realm';
import {IProduct} from 'app/models/Product';

export const ViewProductDetails = ({
  route,
}: StackScreenProps<MainStackParamList, 'ViewProductDetails'>) => {
  const {product: productId} = route.params;
  const realm = useRealm();
  const navigation = useNavigation();
  const [product, setProduct] = useState<IProduct>({} as IProduct);

  useFocusEffect(
    useCallback(() => {
      console.log('here');
      const product = getProduct({realm, productId});
      setProduct(product);
      const unsubscribe = () => setProduct({} as IProduct);

      return () => unsubscribe();
    }, [productId, realm]),
  );

  const onDeleteProduct = useCallback(() => {
    deleteProduct({realm, product});
    navigation.navigate('Inventory');
  }, [realm, product, navigation]);

  const handleEditProduct = useCallback(() => {
    navigation.navigate('EditProduct', {product});
  }, [navigation, product]);

  const handleDeleteProduct = useCallback(() => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product',
      [
        {
          text: 'CANCEL',
        },
        {
          text: 'YES',
          onPress: onDeleteProduct,
        },
      ],
    );
  }, [onDeleteProduct]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight menuOptions={[]} />,
    });
  }, [navigation]);

  return (
    <ScrollView
      style={applyStyles('px-lg', {
        paddingTop: 40,
        backgroundColor: colors.white,
      })}>
      <View style={applyStyles('mb-lg flex-row w-full justify-space-between')}>
        <View style={applyStyles({width: '48%'})}>
          <Text
            style={applyStyles('pb-sm text-400 text-uppercase', {
              color: colors['gray-100'],
            })}>
            Product Name
          </Text>
          <Text
            style={applyStyles('pb-sm text-400', {
              fontSize: 16,
              color: colors['gray-300'],
            })}>
            {product?.name}
          </Text>
        </View>
        <View style={applyStyles({width: '48%'})}>
          <Text
            style={applyStyles('pb-sm text-400 text-uppercase', {
              color: colors['gray-100'],
            })}>
            SKU
          </Text>
          <Text
            style={applyStyles('pb-sm text-400', {
              fontSize: 16,
              color: colors['gray-300'],
            })}>
            {product?.sku}
          </Text>
        </View>
      </View>
      <View style={applyStyles('mb-lg flex-row w-full justify-space-between')}>
        <View style={applyStyles({width: '48%'})}>
          <Text
            style={applyStyles('pb-sm text-400 text-uppercase', {
              color: colors['gray-100'],
            })}>
            Price
          </Text>
          <Text
            style={applyStyles('pb-sm text-400', {
              fontSize: 16,
              color: colors['gray-300'],
            })}>
            &#8358;{numberWithCommas(product?.price)}
          </Text>
        </View>
        {!!product?.quantity && (
          <View style={applyStyles({width: '48%'})}>
            <Text
              style={applyStyles('pb-sm text-400 text-uppercase', {
                color: colors['gray-100'],
              })}>
              Units in stock
            </Text>
            <Text
              style={applyStyles('pb-sm text-400', {
                fontSize: 16,
                color: colors['gray-300'],
              })}>
              {product.quantity}
            </Text>
          </View>
        )}
      </View>
      <View
        style={applyStyles('flex-row w-full justify-space-between', {
          marginTop: 56,
        })}>
        <View style={applyStyles({width: '48%'})}>
          <Button
            title="Delete"
            variantColor="white"
            onPress={handleDeleteProduct}
          />
        </View>
        <View style={applyStyles({width: '48%'})}>
          <Button title="Edit" onPress={handleEditProduct} />
        </View>
      </View>
    </ScrollView>
  );
};
