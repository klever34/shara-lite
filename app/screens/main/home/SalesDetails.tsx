import {ReceiptPreview} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {applyStyles} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {getReceipt} from '@/services/ReceiptService';
import {colors} from '@/styles';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

export const SalesDetails = ({route}: any) => {
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

  return (
    <FlatList
      data={[]}
      style={applyStyles('py-sm flex-1', {
        backgroundColor: colors.white,
      })}
      renderItem={undefined}
      ListHeaderComponent={
        <>
          <View
            style={applyStyles(
              'px-xl mb-xs mb-xl flex-row justify-end w-full',
            )}>
            <Touchable onPress={() => navigation.goBack()}>
              <View style={applyStyles('center', {height: 48, width: 48})}>
                <Icon
                  name="x"
                  size={24}
                  type="feathericons"
                  color={colors['red-200']}
                />
              </View>
            </Touchable>
          </View>
          <ReceiptPreview
            isNew={false}
            receipt={receipt}
            onClose={() => navigation.goBack()}
          />
        </>
      }
    />
  );
};
