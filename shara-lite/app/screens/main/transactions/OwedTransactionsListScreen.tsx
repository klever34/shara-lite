import {HomeContainer} from '@/components';
import {IReceipt} from '@/models/Receipt';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import React, {useCallback} from 'react';
import {KeyboardAvoidingView} from 'react-native';
import {useReceiptList} from './AllTransactionsListScreen';
import {ReceiptListItem} from './ReceiptListItem';

export const OwedTransactionsListScreen = () => {
  const navigation = useAppNavigation();

  const {searchTerm, owedReceipts, handleReceiptSearch} = useReceiptList();

  const handleReceiptItemSelect = useCallback(
    (receipt: IReceipt) => {
      navigation.navigate('ReceiptDetails', {id: receipt._id});
    },
    [navigation],
  );

  const renderReceiptItem = useCallback(
    ({item: receipt}: {item: IReceipt}) => {
      return (
        <ReceiptListItem
          receipt={receipt}
          onPress={() => handleReceiptItemSelect(receipt)}
        />
      );
    },
    [handleReceiptItemSelect],
  );

  return (
    <KeyboardAvoidingView
      style={applyStyles('flex-1', {
        backgroundColor: colors.white,
      })}>
      <HomeContainer<IReceipt>
        showFAB={false}
        data={owedReceipts}
        searchTerm={searchTerm}
        initialNumToRender={10}
        onSearch={handleReceiptSearch}
        renderListItem={renderReceiptItem}
        searchPlaceholderText="Search by customer name"
        keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
      />
    </KeyboardAvoidingView>
  );
};
