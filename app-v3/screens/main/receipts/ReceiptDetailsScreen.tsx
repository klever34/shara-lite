import {ReceiptPreview} from 'app-v3/components';
import {Icon} from 'app-v3/components/Icon';
import Touchable from 'app-v3/components/Touchable';
import {applyStyles} from 'app-v3/helpers/utils';
import {IReceipt} from 'app-v3/models/Receipt';
import {useAppNavigation} from 'app-v3/services/navigation';
import {useRealm} from 'app-v3/services/realm';
import {getReceipt} from 'app-v3/services/ReceiptService';
import {colors} from 'app-v3/styles';
import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';

export const ReceiptDetailsScreen = ({route}: any) => {
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
      style={applyStyles('py-sm flex-1', {
        backgroundColor: colors.white,
      })}>
      <View style={applyStyles('px-xl mb-xs flex-row justify-end w-full')}>
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
    </ScrollView>
  );
};
