import {IReceipt} from '@/models/Receipt';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {getReceipt} from '@/services/ReceiptService';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, BackHandler, View} from 'react-native';
import {ReceiptDetails} from './ReceiptDetails';
import {useReceiptProvider} from './ReceiptProvider';

export const ReceiptReviewScreen = ({route}: any) => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const [receipt, setReceipt] = useState<IReceipt | undefined>();
  const {handleClearReceipt, createReceiptFromCustomer} = useReceiptProvider();

  const handleClose = useCallback(() => {
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

  const handleBackButtonPress = useCallback(() => {
    if (!navigation.isFocused()) {
      return false;
    }
    handleClose();
    return true;
  }, [navigation, handleClose]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const receiptId = route.params.id;
      const retrievedRecipt = getReceipt({realm, receiptId});
      setReceipt(retrievedRecipt);
    });
    return unsubscribe;
  }, [realm, navigation, route.params.id]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonPress,
      );
    };
  }, [handleBackButtonPress]);

  return !receipt ? (
    <View style={applyStyles('flex-1 center bg-white')}>
      <ActivityIndicator color={colors.primary} size={40} />
    </View>
  ) : (
    <ReceiptDetails receipt={receipt} page="review" />
  );
};
