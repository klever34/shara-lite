import {Header} from '@/components';
import {IReceipt} from '@/models/Receipt';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {getReceipt} from '@/services/ReceiptService';
import {applyStyles, colors} from '@/styles';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {ReceiptDetails} from './ReceiptDetails';

export const ReceiptDetailsScreen = ({route}: any) => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const [receipt, setReceipt] = useState<IReceipt | undefined>();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const receiptId = route.params.id;
      const retrievedRecipt = getReceipt({realm, receiptId});
      setReceipt(retrievedRecipt);
    });
    return unsubscribe;
  }, [realm, navigation, route.params.id]);

  return !receipt ? (
    <View style={applyStyles('flex-1 center bg-white')}>
      <ActivityIndicator color={colors.primary} size={40} />
    </View>
  ) : (
    <>
      <Header
        title="View Receipt"
        iconLeft={{iconName: 'arrow-left', onPress: () => navigation.goBack()}}
      />
      <ReceiptDetails receipt={receipt} />
    </>
  );
};
