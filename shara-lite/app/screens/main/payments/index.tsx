import {colors} from '@/styles';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import React from 'react';
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
