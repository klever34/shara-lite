import {IReceipt} from '@/models/Receipt';
import {colors} from '@/styles';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {ReceiptListScreen} from './ReceiptListScreen';

export type ReceiptsStackParamList = {
  ReceiptList: undefined;
  ReceiptDetails: {receipt: IReceipt};
};

const ReceiptsStack = createStackNavigator<ReceiptsStackParamList>();

export const TransactionsScreen = () => {
  return (
    <ReceiptsStack.Navigator
      initialRouteName="ReceiptList"
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
      <ReceiptsStack.Screen name="ReceiptList" component={ReceiptListScreen} />
    </ReceiptsStack.Navigator>
  );
};

export * from './CreateReceipt';
export * from './ReceiptItemModal';
export * from './ReceiptPreviewModal';
