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
import {ScrollView, View} from 'react-native';

export const SalesDetails = ({route}: any) => {
  const realm = useRealm();
  const navigation = useAppNavigation();

  const [receipt, setReceipt] = useState<IReceipt | undefined>();

  useEffect(() => {
    const receiptId = route.params.id;
    const retrievedRecipt = getReceipt({realm, receiptId});
    setReceipt(retrievedRecipt);
  }, [realm, route.params.id]);

  return (
    <ScrollView
      persistentScrollbar
      keyboardShouldPersistTaps="always"
      style={applyStyles('py-sm px-xl flex-1', {
        backgroundColor: colors.white,
      })}>
      <View style={applyStyles('mb-xl flex-row justify-end w-full')}>
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
      <ReceiptPreview isNew={false} receipt={receipt} />
    </ScrollView>
  );
};
