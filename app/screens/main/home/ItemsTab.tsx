import {DatePicker, HomeContainer} from '@/components';
import EmptyState from '@/components/EmptyState';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {applyStyles} from '@/helpers/utils';
import {IProduct} from '@/models/Product';
import {IReceipt} from '@/models/Receipt';
import {IReceiptItem} from '@/models/ReceiptItem';
import {CreateReceipt} from '@/screens/receipt';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {
  getReceipts,
  getReceiptsTotalProductQuantity,
} from '@/services/ReceiptService';
import {colors} from '@/styles';
import {format, isEqual, isToday} from 'date-fns';
import {omit, uniqBy} from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, KeyboardAvoidingView, Text, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import ImagePicker, {ImagePickerOptions} from 'react-native-image-picker';

type ItemsTabProps = ModalWrapperFields & {};

type FilteredProduct = IProduct & {quantitySold: number};

export const ItemsTab = withModal(({openModal}: ItemsTabProps) => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const allReceipts = realm ? getReceipts({realm}) : [];

  const [filter, setFilter] = useState({date: new Date()} || {});
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
    [allReceipts, getFilteredProducts, handleFilterChange],
  );

  const handleSnapReceipt = useCallback(
    (callback: (imageUri: string) => void) => {
      const options: ImagePickerOptions = {
        noData: true,
        maxWidth: 256,
        maxHeight: 256,
        mediaType: 'photo',
        allowsEditing: true,
      };
      ImagePicker.launchCamera(options, (response) => {
        if (response.didCancel) {
          // do nothing
        } else if (response.error) {
          Alert.alert('Error', response.error);
        } else {
          const {uri} = response;
          const extensionIndex = uri.lastIndexOf('.');
          const extension = uri.slice(extensionIndex + 1);
          const allowedExtensions = ['jpg', 'jpeg', 'png'];
          if (!allowedExtensions.includes(extension)) {
            return Alert.alert('Error', 'That file type is not allowed.');
          }
          callback(uri);
        }
      });
    },
    [],
  );

  const onSnapReceipt = useCallback(() => {
    Alert.alert('Coming Soon', 'This feature is coming in the next update');
    // handleSnapReceipt((uri) =>
    //   saveReceipt({
    //     realm,
    //     tax: 0,
    //     payments: [],
    //     amountPaid: 0,
    //     totalAmount: 0,
    //     creditAmount: 0,
    //     receiptItems: [],
    //     local_image_url: uri,
    //     customer: {} as ICustomer,
    //   }),
    // );
  }, []);

  const handleOpenCreateReciptModal = useCallback(() => {
    const closeModal = openModal('full', {
      renderContent: () => (
        <CreateReceipt
          closeReceiptModal={closeModal}
          onSnapReceipt={handleSnapReceipt}
        />
      ),
    });
  }, [openModal, handleSnapReceipt]);

  const renderListItem = useCallback(
    ({item}: {item: FilteredProduct}) => {
      return (
        <View
          style={applyStyles('px-md flex-row center justify-between', {
            height: 50,
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
            {item &&
              item.quantity &&
              item.quantity >= 0 &&
              isToday(filter.date) && (
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
      .filter(dateFilterFunc);

    setProducts(getFilteredProducts(filtered));
    setTotalItems(getReceiptsTotalProductQuantity(filtered));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allReceipts.length]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const allReceiptsData = getReceipts({realm});
      const filtered = allReceiptsData
        .filter((receipt) => !receipt.is_cancelled)
        .filter(dateFilterFunc);

      setProducts(getFilteredProducts(filtered));
      setTotalItems(getReceiptsTotalProductQuantity(filtered));
    });
  }, [dateFilterFunc, getFilteredProducts, navigation, realm]);

  return (
    <KeyboardAvoidingView
      style={applyStyles('flex-1', {backgroundColor: colors.white})}>
      <HomeContainer
        onSnapReceipt={onSnapReceipt}
        onCreateReceipt={handleOpenCreateReciptModal}>
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
      </HomeContainer>
    </KeyboardAvoidingView>
  );
});
