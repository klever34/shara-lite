import {colors} from '@/styles';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {PaymentListScreen} from './PaymentListScreen';

export type ProductsStackParamList = {
  ProductList: undefined;
  ManageItems: undefined;
};

const ProductsStack = createStackNavigator<ProductsStackParamList>();

export const PaymentsScreen = () => {
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
      <ProductsStack.Screen name="ProductList" component={PaymentListScreen} />
    </ProductsStack.Navigator>
  );
};

export * from './PaymentListScreen';
