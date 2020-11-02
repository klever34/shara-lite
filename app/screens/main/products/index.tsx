import React from 'react';
import {colors} from '@/styles';
import {createStackNavigator} from '@react-navigation/stack';
import {ProductListScreen} from './ProductListScreen';
import {ManageItems} from '@/screens/main/products';

export type ProductsStackParamList = {
  ProductList: undefined;
  ManageItems: undefined;
};

const ProductsStack = createStackNavigator<ProductsStackParamList>();

export const ProductsScreen = () => {
  return (
    <ProductsStack.Navigator
      initialRouteName="ProductList"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTitleStyle: {
          fontSize: 16,
          fontFamily: 'CocogoosePro-SemiLight',
        },
        headerTintColor: colors['gray-300'],
      }}>
      <ProductsStack.Screen name="ProductList" component={ProductListScreen} />
      <ProductsStack.Screen
        name="ManageItems"
        component={ManageItems}
        options={{title: 'Manage Items'}}
      />
    </ProductsStack.Navigator>
  );
};

export * from './ProductListScreen';
export * from './ManageItems';
export * from './ActivityTab';
