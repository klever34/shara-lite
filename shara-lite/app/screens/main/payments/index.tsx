import React from 'react';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import {PaymentListScreen} from './PaymentListScreen';

export type ProductsStackParamList = {
  ProductList: undefined;
  ManageItems: undefined;
};

const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();

export const PaymentsScreen = () => {
  return (
    <ProductsStack.Navigator
      initialRouteName="ProductList"
      screenOptions={{
        headerShown: false,
      }}>
      <ProductsStack.Screen name="ProductList" component={PaymentListScreen} />
    </ProductsStack.Navigator>
  );
};

export * from './PaymentListScreen';
