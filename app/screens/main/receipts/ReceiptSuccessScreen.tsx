import {Header, ReceiptPreview} from '@/components';
import {IReceipt} from '@/models/Receipt';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {getReceipt} from '@/services/ReceiptService';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, View} from 'react-native';

export const ReceiptSuccessScreen = ({route}: any) => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const [receipt, setReceipt] = useState<IReceipt | undefined>();

  const handleClose = useCallback(() => navigation.navigate(''), [navigation]);

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
      <FlatList
        data={[]}
        renderItem={undefined}
        style={applyStyles('py-sm flex-1 bg-white')}
        ListHeaderComponent={
          <>
            <Header
              title={`Total: ${receipt.total_amount}`}
              iconRight={{iconName: 'x', onPress: handleClose}}
            />
            <ReceiptPreview receipt={receipt} onClose={handleClose} />
          </>
        }
      />
    </>
  );
};
