import React from 'react';
import {View, Text} from 'react-native';
import {applyStyles} from '@/styles';
import {AppInput} from '@/components';

export const EntryScreen = () => {
  return (
    <View style={applyStyles('flex-1')}>
      <View style={applyStyles('pt-40 py-48 px-16 bg-white')}>
        <View style={applyStyles('items-center mb-24')}>
          <Text style={applyStyles('text-gray-100 text-xxs text-uppercase')}>
            Last Transaction
          </Text>
          <Text style={applyStyles('text-gray-200 text-xs')}>-₦200,000</Text>
        </View>
        <View>
          <Text
            style={applyStyles(
              'bg-gray-20 text-gray-200 py-4 px-8 rounded-4 text-xxs text-uppercase text-700 font-bold self-center mb-8',
            )}>
            Amount
          </Text>
          <Text
            style={applyStyles(
              'text-gray-300 py-4 px-8 rounded-4 text-3xl text-uppercase text-400 self-center mb-8',
            )}>
            ₦1,000.00
          </Text>
        </View>
        <View style={applyStyles('w-full')}>
          <AppInput placeholder="Enter Details (Rent, Bill, Loan...)" />
        </View>
      </View>
    </View>
  );
};

export * from './CreateReceipt';
export * from './ReceiptItemModal';
export * from './ReceiptPreviewModal';
