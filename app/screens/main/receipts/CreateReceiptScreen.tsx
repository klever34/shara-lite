import {Header} from '@/components';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback} from 'react';
import {SafeAreaView} from 'react-native';
import {CreateReceipt} from './CreateReceipt';
import {useReceiptProvider} from './ReceiptProvider';

export const CreateReceiptScreen = ({route}: any) => {
  const navigation = useAppNavigation();
  const receipt = route.params.receipt;
  const {handleClearReceipt, createReceiptFromCustomer} = useReceiptProvider();

  const handleGoBack = useCallback(() => {
    if (createReceiptFromCustomer) {
      handleClearReceipt();
      navigation.navigate('CustomerDetails', {
        customer: createReceiptFromCustomer,
      });
    } else {
      handleClearReceipt();
      navigation.navigate('Home');
    }
  }, [createReceiptFromCustomer, handleClearReceipt, navigation]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <Header
        title="New Receipt"
        headerRight={{options: [{icon: 'x', onPress: handleGoBack}]}}
      />
      <CreateReceipt receipt={receipt} />
    </SafeAreaView>
  );
};
