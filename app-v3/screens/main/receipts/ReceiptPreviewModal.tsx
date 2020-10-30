import {ReceiptPreview} from 'app-v3/components';
import {Icon} from 'app-v3/components/Icon';
import Touchable from 'app-v3/components/Touchable';
import {IReceipt} from 'app-v3/models/Receipt';
import {useRealm} from 'app-v3/services/realm';
import {getReceipt} from 'app-v3/services/ReceiptService';
import {colors} from 'app-v3/styles';
import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {applyStyles} from 'app-v3/styles';

type Props = {
  closeModal(): void;
  receiptId: IReceipt['_id'];
};

export const ReceiptPreviewModal = ({receiptId, closeModal}: Props) => {
  const realm = useRealm();

  const [receipt, setReceipt] = useState<IReceipt | undefined>();

  useEffect(() => {
    const retrievedRecipt = receiptId && getReceipt({realm, receiptId});
    setReceipt(retrievedRecipt);
  }, [realm, receiptId]);

  return (
    <ScrollView
      persistentScrollbar
      keyboardShouldPersistTaps="always"
      style={applyStyles('py-sm flex-1', {
        backgroundColor: colors.white,
      })}>
      <View style={applyStyles('px-xl mb-xs flex-row justify-end w-full')}>
        <Touchable onPress={closeModal}>
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
      <ReceiptPreview isNew receipt={receipt} onClose={closeModal} />
    </ScrollView>
  );
};
