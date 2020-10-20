import {ReceiptPreview} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {applyStyles} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {useRealm} from '@/services/realm';
import {getReceipt} from '@/services/ReceiptService';
import {colors} from '@/styles';
import React, {useEffect, useState} from 'react';
import {ScrollView, View, BackHandler} from 'react-native';

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

  useEffect(() => {
    const backAction = () => {
      closeModal();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [closeModal]);

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
