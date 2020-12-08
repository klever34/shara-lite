import {applyStyles} from '@/styles';
import React from 'react';
import {Text, View, ViewStyle} from 'react-native';

const TransactionListHeader = ({style}: {style?: ViewStyle}) => {
  return (
    <View style={applyStyles('mb-8 flex-row flex-wrap', style)}>
      <View style={applyStyles({width: '40%'})}>
        <Text
          style={applyStyles('text-xxs text-700 text-gray-200 text-uppercase')}>
          Record
        </Text>
      </View>
      <View
        style={applyStyles({
          width: '30%',
          alignItems: 'center',
        })}>
        <Text
          style={applyStyles('text-xxs text-700 text-gray-200 text-uppercase')}>
          You gave
        </Text>
      </View>
      <View
        style={applyStyles('items-end', {
          width: '30%',
        })}>
        <Text
          style={applyStyles('text-xxs text-700 text-gray-200 text-uppercase')}>
          You got
        </Text>
      </View>
    </View>
  );
};

export default TransactionListHeader;
