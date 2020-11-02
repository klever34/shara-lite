import {ReceiptPreview} from 'app-v3/components';
import {Icon} from 'app-v3/components/Icon';
import Touchable from 'app-v3/components/Touchable';
import {IReceipt} from 'app-v3/models/Receipt';
import {useAppNavigation} from 'app-v3/services/navigation';
import {useRealm} from 'app-v3/services/realm';
import {getReceipt} from 'app-v3/services/ReceiptService';
import {colors, applyStyles} from 'app-v3/styles';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, View} from 'react-native';

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
