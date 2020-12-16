import {SearchFilter} from '@/components';
import EmptyState from '@/components/EmptyState';
import {HeaderBackButton} from '@/components/HeaderBackButton';
import {Icon} from '@/components/Icon';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {StackHeaderLeftButtonProps} from '@react-navigation/stack';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {FlatList, SafeAreaView, Text, View} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {TransactionListItem} from './TransactionListItem';

export const useReceiptList = () => {
  const navigation = useAppNavigation();
  const {getTransactions} = useTransaction();
  const receipts = getTransactions();

  const [searchTerm, setSearchTerm] = useState('');
  const [allReceipts, setAllReceipts] = useState(receipts);

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
    let userReceipts = (allReceipts as unknown) as Realm.Results<
      IReceipt & Realm.Object
    >;
    if (searchTerm) {
      userReceipts = userReceipts
        .filtered(`customer.name CONTAINS[c] "${searchTerm}"`)
        .sorted('created_at', true);
    }
    return userReceipts.filter((item) => !item.isPaid);
  }, [allReceipts, searchTerm]);

  const collectedAmount = useMemo(
    () =>
      filteredReceipts
        .filter((item) => item.isPaid)
        .map((item) => item.total_amount)
        .reduce((acc, item) => acc + item, 0),
    [filteredReceipts],
  );
  const outstandingAmount = useMemo(
    () =>
      owedReceipts
        .map((item) => item.credit_amount)
        .reduce((acc, item) => acc + item, 0),
    [owedReceipts],
  );

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const myReceipts = getTransactions();
      setAllReceipts(myReceipts);
    });
  }, [getTransactions, navigation]);

  return useMemo(
    () => ({
      searchTerm,
      owedReceipts,
      collectedAmount,
      filteredReceipts,
      outstandingAmount,
      handleReceiptSearch,
    }),
    [
      searchTerm,
      owedReceipts,
      collectedAmount,
      filteredReceipts,
      outstandingAmount,
      handleReceiptSearch,
    ],
  );
};

export const TransactionListScreen = () => {
  const navigation = useAppNavigation();
  const {
    searchTerm,
    collectedAmount,
    filteredReceipts,
    outstandingAmount,
    handleReceiptSearch,
  } = useReceiptList();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: (props: StackHeaderLeftButtonProps) => {
        return (
          <HeaderBackButton
            {...props}
            backImage={() => {
              return (
                <View style={applyStyles('flex-row center')}>
                  <Icon
                    size={22}
                    name="layers"
                    borderRadius={12}
                    type="feathericons"
                    color={colors['gray-300']}
                  />
                  <Text
                    style={applyStyles(
                      'pl-sm text-md text-gray-300 text-uppercase',
                      {
                        fontFamily: 'Rubik-Medium',
                      },
                    )}
                    numberOfLines={1}>
                    Transactions
                  </Text>
                </View>
              );
            }}
          />
        );
      },
      headerTitle: () => null,
    });
  }, [navigation]);

  const handleReceiptItemSelect = useCallback(
    (receipt: IReceipt) => {
      navigation.navigate('TransactionDetails', {transaction: receipt});
    },
    [navigation],
  );

  const renderTransactionItem = useCallback(
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
    <SafeAreaView style={applyStyles('flex-1')}>
      <View
        style={applyStyles({
          borderWidth: 1.5,
          borderColor: colors['gray-20'],
        })}>
        <SearchFilter
          value={searchTerm}
          onSearch={handleReceiptSearch}
          placeholderText="Search records here"
          onClearInput={() => handleReceiptSearch('')}
        />
      </View>

      <View
        style={applyStyles('flex-row items-center bg-white', {
          borderBottomWidth: 1,
          borderBottomColor: colors['gray-20'],
        })}>
        <View
          style={applyStyles('py-16 flex-row center', {
            width: '48%',
            borderRightWidth: 1,
            borderRightColor: colors['gray-20'],
          })}>
          <View
            style={applyStyles(
              'w-24 h-24 mr-8 rounded-16 center bg-green-200',
            )}>
            <Icon
              size={24}
              name="arrow-up"
              type="feathericons"
              color={colors.white}
            />
          </View>
          <View>
            <Text
              style={applyStyles('pb-4 text-uppercase text-400 text-gray-200')}>
              collected
            </Text>
            <Text style={applyStyles('text-700 text-black text-base')}>
              {amountWithCurrency(collectedAmount)}
            </Text>
          </View>
        </View>
        <View style={applyStyles('py-16 flex-row center', {width: '48%'})}>
          <View
            style={applyStyles('w-24 h-24 mr-8 rounded-16 center bg-red-100')}>
            <Icon
              size={24}
              name="arrow-down"
              type="feathericons"
              color={colors.white}
            />
          </View>
          <View>
            <Text
              style={applyStyles('pb-4 text-uppercase text-400 text-gray-200')}>
              outstanding
            </Text>
            <Text style={applyStyles('text-700 text-black text-base')}>
              {amountWithCurrency(outstandingAmount)}
            </Text>
          </View>
        </View>
      </View>

      {!!filteredReceipts && filteredReceipts.length ? (
        <>
          <View style={applyStyles('px-16 py-12 flex-row bg-gray-10')}>
            <Text style={applyStyles('text-base text-gray-300')}>
              Activities
            </Text>
          </View>
          <FlatList
            data={filteredReceipts}
            initialNumToRender={10}
            style={applyStyles('bg-white')}
            renderItem={renderTransactionItem}
            keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
          />
        </>
      ) : (
        <EmptyState
          style={applyStyles('bg-white')}
          source={require('@/assets/images/emblem.png')}
          imageStyle={applyStyles('pb-32', {width: 80, height: 80})}>
          <View style={applyStyles('center')}>
            <Text style={applyStyles('text-black text-xl pb-4')}>
              You have no records yet.
            </Text>
            <Text style={applyStyles('text-black text-xl')}>
              Start adding records by tapping here
            </Text>
          </View>
          <View style={applyStyles('center p-16 w-full')}>
            <Animatable.View
              duration={200}
              animation={{
                from: {translateY: -10},
                to: {translateY: 0},
              }}
              direction="alternate"
              useNativeDriver={true}
              iterationCount="infinite">
              <Icon
                size={200}
                name="arrow-down"
                type="feathericons"
                color={colors.primary}
              />
            </Animatable.View>
          </View>
        </EmptyState>
      )}
    </SafeAreaView>
  );
};
