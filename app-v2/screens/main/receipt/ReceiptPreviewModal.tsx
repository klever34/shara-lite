import {ReceiptPreview} from 'app-v2/components';
import {Icon} from 'app-v2/components/Icon';
import Touchable from 'app-v2/components/Touchable';
import {applyStyles} from 'app-v2/helpers/utils';
import {IReceipt} from 'app-v2/models/Receipt';
import {useRealm} from 'app-v2/services/realm';
import {getReceipt} from 'app-v2/services/ReceiptService';
import {colors} from 'app-v2/styles';
import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';

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
