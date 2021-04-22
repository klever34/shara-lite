import React from 'react';
import {applyStyles, as} from '@/styles';
import {Text, View} from 'react-native';
import {Button} from '@/components';
import {useAppNavigation} from '@/services/navigation';

export const NotSetTransactionPinModal = ({}: any) => {
  const navigation = useAppNavigation();

  return (
    <View style={applyStyles('items-center py-24')}>
      <Text
        style={applyStyles(
          'text-gray-200 text-500 text-lg text-center pt-8 pb-20 px-12',
        )}>
        Set a Transaction pin before making a withdrawal
      </Text>
      <Button
        title={'Go to Security Settings'}
        style={as('w-1/2')}
        onPress={() => {
          navigation.navigate('SecuritySettings', {});
        }}
      />
    </View>
  );
};
