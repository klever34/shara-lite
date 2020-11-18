import {DatePicker, HomeContainer, useHomeProvider} from 'app-v2/components';
import EmptyState from 'app-v2/components/EmptyState';
import {Icon} from 'app-v2/components/Icon';
import Touchable from 'app-v2/components/Touchable';
import {ModalWrapperFields, withModal} from 'app-v2/helpers/hocs';
import {applyStyles} from 'app-v2/helpers/utils';
import {IProduct} from 'app-v2/models/Product';
import {IReceipt} from 'app-v2/models/Receipt';
import {IReceiptItem} from 'app-v2/models/ReceiptItem';
import {CreateReceipt} from 'app-v2/screens/main/receipt';
import {useAppNavigation} from 'app-v2/services/navigation';
import {useRealm} from 'app-v2/services/realm';
import {
  getReceipts,
  getReceiptsTotalProductQuantity,
} from 'app-v2/services/ReceiptService';
import {colors} from 'app-v2/styles';
import {format, isEqual, isToday} from 'date-fns';
import {omit, uniqBy} from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';
import {KeyboardAvoidingView, Text, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

type ItemsTabProps = ModalWrapperFields & {};

type FilteredProduct = IProduct & {quantitySold: number};

export const ItemsTab = withModal(({openModal}: ItemsTabProps) => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const allReceipts = realm ? getReceipts({realm}) : [];
  const {date: homeDateFilter, handleDateChange} = useHomeProvider();

  const [filter, setFilter] = useState({date: homeDateFilter} || {});
  const [products, setProducts] = useState<FilteredProduct[]>([]);

  const dateFilterFunc = useCallback(
    (receipt: IReceipt) => {
      if (filter.date && receipt.created_at) {
        return isEqual(
          new Date(format(receipt?.created_at, 'MMM dd, yyyy')),
          new Date(format(filter.date, 'MMM dd, yyyy')),
        );
      }
    },
    [filter.date],
  );

  const getFilteredProducts = useCallback((filteredReceipts: IReceipt[]) => {
    const receiptProducts = filteredReceipts
      .reduce(
        (acc, receipt) => [...acc, ...(receipt.items ?? [])],
        [] as IReceiptItem[],
      )
      .map((receiptItem) => receiptItem.product);
    const quantitySold = (product: IProduct) =>
      filteredReceipts
        .reduce(
          (acc, receipt) => [...acc, ...(receipt.items ?? [])],
          [] as IReceiptItem[],
        )
        .filter((receiptItem) => receiptItem.product.name === product.name)
        .reduce((acc, receiptItem) => acc + receiptItem.quantity, 0);

    return uniqBy(
      receiptProducts.map((item) => ({
        ...omit(item),
        quantitySold: quantitySold(item),
      })),
      'name',
    );
  }, []);

  const [totalItems, setTotalItems] = useState(
    getReceiptsTotalProductQuantity(allReceipts.filter(dateFilterFunc)) || 0,
  );

  const handleFilterChange = useCallback((key, value) => {
    setFilter((prevFilter) => ({...prevFilter, [key]: value}));
  }, []);

  const handleDateFilter = useCallback(
    (date?: Date) => {
      if (date) {
        handleDateChange(date);
        handleFilterChange('date', date);
        const filtered = allReceipts
          .filter((receipt) => !receipt.is_cancelled)
          .filter((receipt) => {
            if (date && receipt.created_at) {
              return isEqual(
                new Date(format(receipt.created_at, 'MMM dd, yyyy')),
                new Date(format(date, 'MMM dd, yyyy')),
              );
            }
          });

        setProducts(getFilteredProducts(filtered));
        setTotalItems(getReceiptsTotalProductQuantity(filtered));
      }
    },
    [allReceipts, handleDateChange, getFilteredProducts, handleFilterChange],
  );

  const handleOpenCreateReciptModal = useCallback(() => {
    const closeModal = openModal('full', {
      animationInTiming: 0.1,
      animationOutTiming: 0.1,
      renderContent: () => <CreateReceipt closeReceiptModal={closeModal} />,
    });
  }, [openModal]);

  const renderListItem = useCallback(
    ({item}: {item: FilteredProduct}) => {
      const showQuantityLeft =
        item && item.quantity && item.quantity >= 0 && isToday(filter.date);
      return (
        <View
          style={applyStyles('px-md flex-row center justify-between', {
            height: 52,
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-20'],
          })}>
          <View>
            <Text
              style={applyStyles('text-400', {
                fontSize: 16,
                color: colors['gray-300'],
              })}>
              {item.name}
            </Text>
          </View>
          <View style={applyStyles('items-end')}>
            <View>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 10,
                  color: colors['gray-100'],
                })}>
                {item.quantitySold}{' '}
                {isToday(filter.date) ? 'sold today' : 'sold'}
              </Text>
            </View>
            {!!showQuantityLeft && (
              <View style={applyStyles('flex-row items-center')}>
                <Text
                  style={applyStyles('text-500 pr-xs', {
                    fontSize: 16,
                    color: colors['gray-300'],
                  })}>
                  {item.quantity}
                </Text>
                <Text
                  style={applyStyles('text-400', {
                    fontSize: 16,
                    color: colors['gray-300'],
                  })}>
                  left
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    },
    [filter.date],
  );

  useEffect(() => {
    const filtered = allReceipts
      .filter((receipt) => !receipt.is_cancelled)
      .filter((receipt: IReceipt) => {
        if (receipt.created_at) {
          return isEqual(
            new Date(format(receipt?.created_at, 'MMM dd, yyyy')),
            new Date(format(homeDateFilter, 'MMM dd, yyyy')),
          );
        }
      });

    handleFilterChange('date', homeDateFilter);
    setProducts(getFilteredProducts(filtered));
    setTotalItems(getReceiptsTotalProductQuantity(filtered));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allReceipts.length]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const allReceiptsData = getReceipts({realm});
      const filtered = allReceiptsData
        .filter((receipt) => !receipt.is_cancelled)
        .filter((receipt: IReceipt) => {
          if (receipt.created_at) {
            return isEqual(
              new Date(format(receipt?.created_at, 'MMM dd, yyyy')),
              new Date(format(homeDateFilter, 'MMM dd, yyyy')),
            );
          }
        });

      handleFilterChange('date', homeDateFilter);
      setProducts(getFilteredProducts(filtered));
      setTotalItems(getReceiptsTotalProductQuantity(filtered));
    });
  }, [
    handleFilterChange,
    getFilteredProducts,
    navigation,
    realm,
    homeDateFilter,
  ]);

  return (
    <KeyboardAvoidingView
      style={applyStyles('flex-1', {backgroundColor: colors.white})}>
      <HomeContainer onCreateReceipt={handleOpenCreateReciptModal}>
        <View
          style={applyStyles('p-md center flex-row justify-between', {
            backgroundColor: colors['gray-300'],
          })}>
          <View>
            <DatePicker
              value={filter.date}
              maximumDate={new Date()}
              onChange={(e: Event, date?: Date) => handleDateFilter(date)}>
              {(toggleShow: any) => (
                <Touchable onPress={toggleShow}>
                  <View style={applyStyles('flex-row center', {height: 40})}>
                    <Icon
                      size={24}
                      name="calendar"
                      type="feathericons"
                      color={colors.white}
                    />
                    <Text
                      style={applyStyles('text-700 px-md', {
                        fontSize: 16,
                        color: colors.white,
                      })}>
                      {isToday(filter.date)
                        ? 'Today'
                        : `${format(filter.date, 'MMM dd, yyyy')}`}
                    </Text>
                    <Icon
                      size={24}
                      type="feathericons"
                      name="chevron-down"
                      color={colors.white}
                    />
                  </View>
                </Touchable>
              )}
            </DatePicker>
          </View>
          <View style={applyStyles('items-end')}>
            <Text
              style={applyStyles('text-400 text-uppercase', {
                fontSize: 14,
                color: colors.white,
              })}>
              You sold
            </Text>
            <Text
              style={applyStyles('text-700', {
                fontSize: 16,
                color: colors.white,
              })}>
              {totalItems} Items
            </Text>
          </View>
        </View>
        <View
          style={applyStyles(
            'px-md py-md w-full flex-row items-center justify-between',
            {
              elevation: 2,
              borderTopWidth: 1,
              borderTopColor: colors['gray-20'],
              backgroundColor: colors['gray-10'],
            },
          )}>
          <View>
            <Text
              style={applyStyles('text-400', {
                fontSize: 16,
                color: colors['gray-300'],
              })}>
              Current items
            </Text>
            <Text
              style={applyStyles('text-500', {
                fontSize: 16,
                color: colors['gray-300'],
              })}>
              {format(filter.date, 'MMM dd, yyyy')}
            </Text>
          </View>
          <View>
            <Touchable onPress={() => navigation.navigate('ManageItems')}>
              <View style={applyStyles('px-md py-md flex-row items-center')}>
                <Icon
                  size={16}
                  name="sliders"
                  type="feathericons"
                  color={colors.primary}
                />
                <Text
                  style={applyStyles('pl-sm text-500 text-uppercase', {
                    fontSize: 12,
                    color: colors.primary,
                    textDecorationLine: 'underline',
                  })}>
                  Manage items
                </Text>
              </View>
            </Touchable>
          </View>
        </View>
        <FlatList
          data={products}
          initialNumToRender={10}
          renderItem={renderListItem}
          keyboardShouldPersistTaps="always"
          keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
          ListEmptyComponent={
            <EmptyState
              heading="No items"
              text="No items sold today"
              style={applyStyles({paddingTop: 100})}
            />
          }
        />
      </HomeContainer>
    </KeyboardAvoidingView>
  );
});
