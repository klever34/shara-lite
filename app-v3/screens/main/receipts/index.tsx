import React from 'react';
import {IReceipt} from 'app-v3/models/Receipt';
import {colors} from 'app-v3/styles';
import {createStackNavigator} from '@react-navigation/stack';
import {ReceiptListScreen} from './ReceiptListScreen';
import {ReceiptDetailsScreen} from './ReceiptDetailsScreen';

export type ReceiptsStackParamList = {
  ReceiptList: undefined;
  ReceiptDetails: {receipt: IReceipt};
};

const ReceiptsStack = createStackNavigator<ReceiptsStackParamList>();

export const ReceiptsScreen = () => {
  return (
    <ReceiptsStack.Navigator
      initialRouteName="ReceiptList"
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
      <ReceiptsStack.Screen name="ReceiptList" component={ReceiptListScreen} />
      <ReceiptsStack.Screen
        name="ReceiptDetails"
        component={ReceiptDetailsScreen}
        options={{headerShown: false}}
      />
    </ReceiptsStack.Navigator>
  );
};

export * from './CreateReceipt';
export * from './ReceiptItemModal';
export * from './ReceiptPreviewModal';
