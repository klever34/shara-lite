import {CustomerListScreen} from '@/screens/main/customers/CustomerListScreen';
import React from 'react';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';

export type CustomersStackParamList = {
  CustomerList: undefined;
};

const CustomersStack = createNativeStackNavigator<CustomersStackParamList>();

export const CustomersScreen = () => {
  return (
    <CustomersStack.Navigator
      initialRouteName="CustomerList"
      screenOptions={{
        headerShown: false,
        headerBackTitleVisible: false
      }}>
      <CustomersStack.Screen
        name="CustomerList"
        component={CustomerListScreen}
      />
    </CustomersStack.Navigator>
  );
};
