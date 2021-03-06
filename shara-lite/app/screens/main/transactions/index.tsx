import {IReceipt} from '@/models/Receipt';
import {colors} from '@/styles';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {TransactionListScreen} from './TransactionListScreen';

export type TransactionStackParamList = {
  TransactionList: undefined;
  ReceiptDetails: {receipt: IReceipt};
};

const ReceiptsStack = createStackNavigator<TransactionStackParamList>();

export const TransactionsScreen = () => {
  return (
    <ReceiptsStack.Navigator
      initialRouteName="TransactionList"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTitleStyle: {
          fontSize: 16,
          fontFamily: 'Roboto-Regular',
        },
        headerTintColor: colors['gray-300'],
      }}>
      <ReceiptsStack.Screen
        name="TransactionList"
        component={TransactionListScreen}
      />
    </ReceiptsStack.Navigator>
  );
};
