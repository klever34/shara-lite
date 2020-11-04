import {IReceipt} from '@/models/Receipt';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {getReceipt} from '@/services/ReceiptService';
import React, {useEffect, useState} from 'react';
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

  return <ReceiptDetails receipt={receipt} />;
};
