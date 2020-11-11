import {colors} from '@/styles';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {CustomerListScreen} from '@/screens/main/customers/CustomerListScreen';

export type CustomersStackParamList = {
  CustomerList: undefined;
};

const CustomersStack = createStackNavigator<CustomersStackParamList>();

export const CustomersScreen = () => {
  return (
    <CustomersStack.Navigator
      initialRouteName="CustomerList"
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
      <CustomersStack.Screen
        name="CustomerList"
        component={CustomerListScreen}
      />
    </CustomersStack.Navigator>
  );
};

export * from './AddCustomer';
