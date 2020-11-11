import {Header} from '@/components';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback} from 'react';
import {SafeAreaView} from 'react-native';
import {CreateReceipt} from './CreateReceipt';

export const CreateReceiptScreen = ({route}: any) => {
  const navigation = useAppNavigation();
  const receipt = route.params.receipt;

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <Header
        title="New Receipt"
        iconRight={{iconName: 'x', onPress: handleGoBack}}
      />
      <CreateReceipt receipt={receipt} />
    </SafeAreaView>
  );
};
