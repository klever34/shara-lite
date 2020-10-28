import {colors} from 'app-v3/styles';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {
  AddCustomer,
  CustomerListScreen,
} from 'app-v3/screens/main/customers/CustomerListScreen';
import {ICustomer} from 'app-v3/models';
import CustomerDetails from 'app-v3/screens/main/customers/CustomerDetails';

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
