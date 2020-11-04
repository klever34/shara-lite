import {
  receiptTableHeaderStyles,
  receiptTableItemStyles,
  receiptTableStyles,
} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency, numberWithCommas} from '@/helpers/utils';
import {IProduct} from '@/models/Product';
import {ReceiptItemModalContent} from '@/screens/main/receipts';
import {getAnalyticsService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {
  getProducts,
  saveProduct,
  updateProduct,
} from '@/services/ProductService';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import {orderBy} from 'lodash';
import React, {useCallback} from 'react';
import {FlatList, SafeAreaView, Text, View} from 'react-native';
import {applyStyles} from '@/styles';

type Props = ModalWrapperFields;

export const ItemsTab = withModal(({openModal}: Props) => {
  const realm = useRealm();
  const products = getProducts({realm});
  const sortedProducts = orderBy(products, 'name', 'asc');

  const handleError = useErrorHandler();

  const handleUpdateItem = useCallback(
    (item: IProduct) => {
      updateProduct({realm, product: item, updates: item});
    },
    [realm],
  );

  const handleAddItem = useCallback(
    (item: IProduct) => {
      if (
        products
          .map((product) => product._id?.toString())
          .includes(item?._id?.toString())
      ) {
        handleUpdateItem(item);
      } else {
        getAnalyticsService().logEvent('productStart').catch(handleError);
        getAnalyticsService()
          .logEvent('productAddedToReceipt')
          .catch(handleError);
        saveProduct({
          realm,
          product: item,
        });
      }
    },
    [products, handleUpdateItem, handleError, realm],
  );

  const handleOpenReceiptItemModal = useCallback(() => {
    const closeReceiptItemModal = openModal('full', {
      animationInTiming: 0.1,
      animationOutTiming: 0.1,
      renderContent: () => (
        <ReceiptItemModalContent
          type="item"
          onDone={handleAddItem}
          closeModal={closeReceiptItemModal}
        />
      ),
    });
  }, [handleAddItem, openModal]);

  const handleOpenEditReceiptItemModal = useCallback(
    (item: IProduct) => {
      getAnalyticsService()
        .logEvent('selectContent', {
          item_id: String(item._id),
          content_type: 'Product',
        })
        .catch(handleError);
      const closeReceiptItemModal = openModal('full', {
        animationInTiming: 0.1,
        animationOutTiming: 0.1,
        renderContent: () => (
          <ReceiptItemModalContent
            item={item}
            type="item"
            onDone={handleUpdateItem}
            closeModal={closeReceiptItemModal}
          />
        ),
      });
    },
    [handleError, openModal, handleUpdateItem],
  );

  const renderListItem = useCallback(
    ({item}: {item: IProduct}) => {
      return (
        <Touchable onPress={() => handleOpenEditReceiptItemModal(item)}>
          <View
            style={applyStyles(
              receiptTableStyles.row,
              receiptTableItemStyles.row,
            )}>
            <View style={applyStyles()}>
              <Text>{item.name}</Text>
            </View>
            <View
              style={applyStyles({
                alignItems: 'flex-end',
              })}>
              <Text>{amountWithCurrency(item.price)}</Text>
            </View>
            <View
              style={applyStyles({
                alignItems: 'flex-end',
              })}>
              <Text>{numberWithCommas(item.quantity)}</Text>
            </View>
          </View>
        </Touchable>
      );
    },
    [handleOpenEditReceiptItemModal],
  );

  return (
    <SafeAreaView style={applyStyles('py-md flex-1 bg-white')}>
      <FlatList
        data={sortedProducts}
        renderItem={renderListItem}
        keyboardShouldPersistTaps="always"
        keyExtractor={(item) => `${item?._id?.toString()}`}
        ListHeaderComponent={
          <>
            <View
              style={applyStyles(
                receiptTableStyles.row,
                receiptTableHeaderStyles.row,
              )}>
              <View style={applyStyles('px-xs')}>
                <Text>Item</Text>
              </View>
              <View
                style={applyStyles('px-xs', {
                  alignItems: 'flex-end',
                })}>
                <Text>Sales Price</Text>
              </View>
              <View
                style={applyStyles('px-xs', {
                  alignItems: 'flex-end',
                })}>
                <Text>QTY</Text>
              </View>
            </View>
            <Touchable onPress={handleOpenReceiptItemModal}>
              <View
                style={applyStyles(
                  receiptTableStyles.row,
                  receiptTableHeaderStyles.row,
                  {
                    height: 48,
                    borderTopWidth: 0,
                  },
                )}>
                <View>
                  <View
                    style={applyStyles('flex-row items-center h-full w-full')}>
                    <Icon
                      name="plus"
                      type="feathericons"
                      color={colors.primary}
                    />
                    <Text
                      style={applyStyles('text-500', {
                        fontSize: 14,
                        color: colors.primary,
                      })}>
                      Create New Item
                    </Text>
                  </View>
                </View>
              </View>
            </Touchable>
          </>
        }
      />
    </SafeAreaView>
  );
});
