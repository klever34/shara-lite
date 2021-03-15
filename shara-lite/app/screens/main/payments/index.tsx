import {getAuthService, getRemoteConfigService} from '@/services';
import React, {useMemo} from 'react';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import PaymentContainer from './PaymentContainer';
import {PaymentListScreen} from './PaymentListScreen';
import {useSharaMoney} from '@/screens/main/HomeScreen';

export type ProductsStackParamList = {
  ProductList: undefined;
  ManageItems: undefined;
  WithdrawalMethod: undefined;
};

const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();

export const PaymentsScreen = () => {
  const {enableSharaMoney} = useSharaMoney();
  const initialRouteName = useMemo(() => {
    const sharaMoneyRouteName = 'WithdrawalMethod';
    const fallbackRouteName = 'ProductList';
    if (!enableSharaMoney) {
      return fallbackRouteName;
    }
    try {
      const sharaMoneyEnabledCountries = getRemoteConfigService()
        .getValue('sharaMoneyEnabledCountries')
        .asString();
      const user = getAuthService().getUser();
      return JSON.parse(sharaMoneyEnabledCountries)[user?.currency_code ?? '']
        ? sharaMoneyRouteName
        : fallbackRouteName;
    } catch (e) {
      return fallbackRouteName;
    }
  }, [enableSharaMoney]);
  return (
    <ProductsStack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}>
      <ProductsStack.Screen
        name="WithdrawalMethod"
        component={PaymentListScreen}
      />
      <ProductsStack.Screen name="ProductList" component={PaymentContainer} />
    </ProductsStack.Navigator>
  );
};

export * from './PaymentListScreen';
