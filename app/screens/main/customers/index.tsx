import {colors} from '@/styles';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {
  AddCustomer,
  CustomerListScreen,
} from '@/screens/main/customers/CustomerListScreen';
import {ICustomer} from '@/models';
import CustomerDetails from '@/screens/main/customers/CustomerDetails';

export type CustomersStackParamList = {
  CustomerList: undefined;
  CustomerDetails: {customer: ICustomer};
  AddCustomer: undefined;
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
      <CustomersStack.Screen
        name="AddCustomer"
        component={AddCustomer}
        options={{
          title: 'Add Customer',
        }}
      />
      <CustomersStack.Screen
        name="CustomerDetails"
        component={CustomerDetails}
        options={({route}) => ({
          title: route.params.customer.name,
        })}
      />
    </CustomersStack.Navigator>
  );
};

export * from './AddCustomer';
