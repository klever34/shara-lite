import {getAuthService, getRemoteConfigService} from '@/services';
import React, {useMemo} from 'react';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import PaymentContainer from './PaymentContainer';
import {PaymentListScreen} from './PaymentListScreen';

export type ProductsStackParamList = {
  ProductList: undefined;
  ManageItems: undefined;
  WithdrawalMethod: undefined;
};

const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();

export const PaymentsScreen = () => {
  const initialRouteName = useMemo(() => {
    try {
      const sharaMoneyEnabledCountries = getRemoteConfigService()
        .getValue('sharaMoneyEnabledCountries')
        .asString();
      const user = getAuthService().getUser();
      return JSON.parse(sharaMoneyEnabledCountries)[user?.currency_code ?? '']
        ? 'WithdrawalMethod'
        : 'ProductList';
    } catch (e) {
      return 'ProductList';
    }
  }, []);
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
