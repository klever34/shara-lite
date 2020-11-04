import {HeaderRight, HomeContainer} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {withModal} from '@/helpers/hocs';
import {IProduct} from '@/models/Product';
import {useAppNavigation} from '@/services/navigation';
import {getProducts} from '@/services/ProductService';
import {useRealm} from '@/services/realm';
import {applyStyles, colors} from '@/styles';
import {
  HeaderBackButton,
  StackHeaderLeftButtonProps,
} from '@react-navigation/stack';
import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import {Alert, KeyboardAvoidingView, Text, View} from 'react-native';

export const ProductListScreen = withModal(() => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const products = realm ? getProducts({realm}) : [];

  const [searchTerm, setSearchTerm] = useState('');

  const handleProductSearch = useCallback((text) => {
    setSearchTerm(text);
  }, []);

  const handleCreateProduct = useCallback(() => {
    Alert.alert('Coming soon', 'This feature is coming in the next PR');
  }, []);

  const filteredProducts = useMemo(() => {
    let userProducts = (products as unknown) as Realm.Results<
      IProduct & Realm.Object
    >;
    if (searchTerm) {
      userProducts = userProducts.filtered(`name CONTAINS[c] "${searchTerm}"`);
    }
    return (userProducts.sorted('created_at', true) as unknown) as IProduct[];
  }, [products, searchTerm]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: applyStyles('border-b-1', {
        elevation: 0,
      }),
      headerLeft: (props: StackHeaderLeftButtonProps) => {
        return (
          <HeaderBackButton
            {...props}
            backImage={() => {
              return (
                <View style={applyStyles('flex-row center')}>
                  <Icon
                    type="feathericons"
                    color={colors['gray-300']}
                    name="box"
                    size={28}
                    borderRadius={12}
                  />
                  <Text
                    style={applyStyles(
                      'pl-sm text-md text-gray-300 text-uppercase',
                      {
                        fontFamily: 'Rubik-Medium',
                      },
                    )}
                    numberOfLines={1}>
                    Products
                  </Text>
                </View>
              );
            }}
          />
        );
      },
      headerTitle: () => null,
      headerRight: () => (
        <HeaderRight
          menuOptions={[
            {
              text: 'Help',
              onSelect: () => {},
            },
          ]}
        />
      ),
    });
  }, [navigation]);

  const renderListItem = useCallback(({item}: {item: IProduct}) => {
    return (
      <Touchable onPress={undefined}>
        <View
          style={applyStyles('p-16 flex-row items-center justify-between', {
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-20'],
          })}>
          <View>
            <Text style={applyStyles('text-700 text-gray-300 text-uppercase')}>
              {item.name}
            </Text>
          </View>
          <View style={applyStyles('items-end')}>
            <View style={applyStyles('flex-row items-center')}>
              <Text style={applyStyles('text-700 text-gray-300 pr-xs')}>
                {item.quantity}
              </Text>
              <Text
                style={applyStyles(
                  'text-400 text-xs text-gray-100 text-uppercase',
                )}>
                left
              </Text>
            </View>
          </View>
        </View>
      </Touchable>
    );
  }, []);

  return (
    <KeyboardAvoidingView
      style={applyStyles('flex-1', {backgroundColor: colors.white})}>
      <HomeContainer<IProduct>
        data={filteredProducts}
        initialNumToRender={10}
        headerTitle="total products"
        createEntityButtonIcon="box"
        onSearch={handleProductSearch}
        renderListItem={renderListItem}
        onCreateEntity={handleCreateProduct}
        createEntityButtonText="Add Product"
        searchPlaceholderText="Search Products"
        headerAmount={filteredProducts.length.toString()}
        keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
        emptyStateProps={{
          heading: 'Add your Products',
          text:
            "You have no products yet. Let's help you load your products to create receipts faster and monitor stock levels.",
        }}
      />
    </KeyboardAvoidingView>
  );
});
