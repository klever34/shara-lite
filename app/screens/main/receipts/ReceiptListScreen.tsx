import {HeaderRight, HomeContainer} from '@/components';
import {Icon} from '@/components/Icon';
import {withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {getAuthService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {getReceipts, getReceiptsTotalAmount} from '@/services/ReceiptService';
import {applyStyles, colors} from '@/styles';
import {
  HeaderBackButton,
  StackHeaderLeftButtonProps,
} from '@react-navigation/stack';
import {endOfDay, isToday, startOfDay, subMonths} from 'date-fns';
import {subDays, subWeeks, subYears} from 'date-fns/esm';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {Alert, KeyboardAvoidingView, Text, View} from 'react-native';
import {ReceiptListItem} from './ReceiptListItem';

export const useReceiptList = ({initialFilter = 'recent'} = {}) => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const receipts = realm ? getReceipts({realm}) : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [allReceipts, setAllReceipts] = useState(receipts || []);

  const getRecentSalesDate = useCallback(() => {
    const myReceipts = (allReceipts as unknown) as Realm.Results<
      IReceipt & Realm.Object
    >;
    if (myReceipts.length) {
      const receiptsSortedByDate = myReceipts.sorted('created_at', true);
      const recentReceipt = receiptsSortedByDate[0];
      if (
        recentReceipt &&
        recentReceipt.created_at &&
        !isToday(recentReceipt.created_at)
      ) {
        return recentReceipt.created_at;
      }
    }
    return new Date();
  }, [allReceipts]);

  const handleStatusFilter = useCallback((status: any) => {
    setFilter(status);
  }, []);

  const filterOptions = useMemo(
    () => [
      {text: 'Recent', onSelect: () => handleStatusFilter('recent')},
      {text: 'Today', onSelect: () => handleStatusFilter('today')},
      {text: '3 Days', onSelect: () => handleStatusFilter('3-days')},
      {text: '1 Week', onSelect: () => handleStatusFilter('1-week')},
      {text: '1 Month', onSelect: () => handleStatusFilter('1-month')},
      {text: '3 Months', onSelect: () => handleStatusFilter('3-months')},
      {text: '1 Year', onSelect: () => handleStatusFilter('1-year')},
      {text: 'All Time', onSelect: () => handleStatusFilter('all')},
    ],
    [handleStatusFilter],
  );

  const handleReceiptSearch = useCallback((text) => {
    setSearchTerm(text);
  }, []);

  const filteredReceipts = useMemo(() => {
    let userReceipts = (allReceipts as unknown) as Realm.Results<
      IReceipt & Realm.Object
    >;
    if (filter) {
      switch (filter) {
        case 'all':
          userReceipts = userReceipts;
          break;
        case 'recent':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at < $1',
            subDays(getRecentSalesDate(), 7),
            getRecentSalesDate(),
          );
          break;
        case 'today':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at <= $1',
            startOfDay(new Date()),
            endOfDay(new Date()),
          );
          break;
        case '3-days':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at < $1',
            subDays(new Date(), 3),
            new Date(),
          );
          break;
        case '1-week':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at < $1',
            subWeeks(new Date(), 1),
            new Date(),
          );
          break;
        case '1-month':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at < $1',
            subMonths(new Date(), 1),
            new Date(),
          );
          break;
        case '3-months':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at < $1',
            subMonths(new Date(), 3),
            new Date(),
          );
          break;
        case '1-year':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at < $1',
            subYears(new Date(), 1),
            new Date(),
          );
          break;
        default:
          userReceipts = userReceipts;
          break;
      }
    }
    if (searchTerm) {
      userReceipts = userReceipts.filtered(
        `customer.name CONTAINS[c] "${searchTerm}"`,
      );
    }
    return (userReceipts.sorted('created_at', true) as unknown) as IReceipt[];
  }, [allReceipts, searchTerm, filter, getRecentSalesDate]);

  const filterOptionLabels = {
    today: 'Today',
    recent: 'Recent',
    '3-days': '3 Days',
    '1-week': '1 Week',
    '1-month': '1 Month',
    '3-months': '3 Months',
    '1-year': '1 Year',
    all: 'All Time',
  } as {[key: string]: string};

  const totalAmount = useMemo(() => {
    if (filter || searchTerm) {
      //@ts-ignore
      return getReceiptsTotalAmount(filteredReceipts);
    }

    return 0;
  }, [filter, searchTerm, filteredReceipts]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const myReceipts = realm ? getReceipts({realm}) : [];
      setAllReceipts(myReceipts);
    });
  }, [navigation, realm]);

  return useMemo(
    () => ({
      filter,
      filterOptionLabels,
      filteredReceipts,
      totalAmount,
      filterOptions,
      handleReceiptSearch,
    }),
    [
      filter,
      filterOptionLabels,
      filterOptions,
      totalAmount,
      filteredReceipts,
      handleReceiptSearch,
    ],
  );
};

export const ReceiptListScreen = withModal(() => {
  const navigation = useAppNavigation();
  const [business, setBusiness] = useState(getAuthService().getBusinessInfo());

  const headerImage = business.profile_image?.url
    ? {
        uri: business.profile_image.url,
      }
    : require('@/assets/images/shara-user-img.png');

  const {
    filter,
    filteredReceipts,
    filterOptionLabels,
    filterOptions,
    handleReceiptSearch,
    totalAmount,
  } = useReceiptList();

  const handleCreateReceipt = useCallback(() => {
    navigation.navigate('CreateReceipt', {});
  }, [navigation]);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: applyStyles('border-b-1', {
        elevation: 0,
      }),
      headerLeft: (props: StackHeaderLeftButtonProps) => {
        return (
          <HeaderBackButton
            {...props}
            backImage={() => {
              return (
                <View style={applyStyles('flex-row center')}>
                  <Icon
                    type="feathericons"
                    color={colors['gray-300']}
                    name="file-text"
                    size={22}
                    borderRadius={12}
                  />
                  <Text
                    style={applyStyles(
                      'pl-sm text-md text-gray-300 text-uppercase',
                      {
                        fontFamily: 'Rubik-Medium',
                      },
                    )}
                    numberOfLines={1}>
                    Receipts
                  </Text>
                </View>
              );
            }}
          />
        );
      },
      headerTitle: () => null,
      headerRight: () => (
        <HeaderRight
          menuOptions={[
            {
              text: 'Help',
              onSelect: () => {
                Alert.alert(
                  'Coming Soon',
                  'This feature is coming in the next update',
                );
              },
            },
          ]}
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      setBusiness(getAuthService().getBusinessInfo());
    });
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={applyStyles('flex-1', {
        backgroundColor: colors.white,
      })}>
      <HomeContainer<IReceipt>
        initialNumToRender={10}
        headerTitle="total sales"
        headerImage={headerImage}
        filterOptions={filterOptions}
        onSearch={handleReceiptSearch}
        createEntityButtonIcon="file-text"
        renderListItem={renderReceiptItem}
        data={filteredReceipts as IReceipt[]}
        onCreateEntity={handleCreateReceipt}
        createEntityButtonText="Create Receipt"
        activeFilter={filterOptionLabels[filter]}
        headerAmount={amountWithCurrency(totalAmount)}
        searchPlaceholderText="Search by customer name"
        keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
        emptyStateProps={{
          heading: 'Create your first Receipt',
          text:
            'You have no receipts yet. Let’s help you create one it takes only a few seconds.',
        }}
      />
    </KeyboardAvoidingView>
  );
});
