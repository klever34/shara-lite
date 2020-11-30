import {HomeContainer} from '@/components';
import {IReceipt} from '@/models/Receipt';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {KeyboardAvoidingView} from 'react-native';
import {TransactionListItem} from './TransactionListItem';

export const useReceiptList = () => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const {getTransactions} = useTransaction();
  const receipts = getTransactions();

  const [searchTerm, setSearchTerm] = useState('');
  const [allReceipts, setAllReceipts] = useState(receipts || []);

  const handleReceiptSearch = useCallback((text) => {
    setSearchTerm(text);
  }, []);

  const filteredReceipts = useMemo(() => {
    let userReceipts = (allReceipts as unknown) as Realm.Results<
      IReceipt & Realm.Object
    >;
    if (searchTerm) {
      userReceipts = userReceipts.filtered(
        `customer.name CONTAINS[c] "${searchTerm}"`,
      );
    }
    return (userReceipts.sorted('created_at', true) as unknown) as IReceipt[];
  }, [allReceipts, searchTerm]);

  const owedReceipts = useMemo(() => {
    let userReceipts = (allReceipts.filter(
      (item) => !item.isPaid,
    ) as unknown) as Realm.Results<IReceipt & Realm.Object>;
    if (searchTerm) {
      userReceipts = userReceipts.filtered(
        `customer.name CONTAINS[c] "${searchTerm}"`,
      );
    }
    return (userReceipts as unknown) as IReceipt[];
    // return userReceipts.sorted('created_at', true);
  }, [allReceipts, searchTerm]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const myReceipts = getTransactions();
      setAllReceipts(myReceipts);
    });
  }, [getTransactions, navigation, realm]);

  return useMemo(
    () => ({
      searchTerm,
      owedReceipts,
      filteredReceipts,
      handleReceiptSearch,
    }),
    [searchTerm, owedReceipts, filteredReceipts, handleReceiptSearch],
  );
};

export const AllTransactionsListScreen = () => {
  const navigation = useAppNavigation();

  const {searchTerm, filteredReceipts, handleReceiptSearch} = useReceiptList();

  const handleReceiptItemSelect = useCallback(
    (receipt: IReceipt) => {
      navigation.navigate('TransactionDetails', {transaction: receipt});
    },
    [navigation],
  );

  const renderReceiptItem = useCallback(
    ({item: receipt}: {item: IReceipt}) => {
      return (
        <TransactionListItem
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
        searchTerm={searchTerm}
        data={filteredReceipts}
        initialNumToRender={10}
        onSearch={handleReceiptSearch}
        renderListItem={renderReceiptItem}
        searchPlaceholderText="Search by customer name"
        keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
      />
    </KeyboardAvoidingView>
  );
};
