import {
  summaryTableHeaderStyles,
  summaryTableItemStyles,
  summaryTableStyles,
} from 'app-v3/components';
import {Icon} from 'app-v3/components/Icon';
import Touchable from 'app-v3/components/Touchable';
import {ModalWrapperFields, withModal} from 'app-v3/helpers/hocs';
import {amountWithCurrency, numberWithCommas} from 'app-v3/helpers/utils';
import {IProduct} from 'app-v3/models/Product';
import {ReceiptItemModalContent} from 'app-v3/screens/main/receipts';
import {getAnalyticsService} from 'app-v3/services';
import {useErrorHandler} from 'app-v3/services/error-boundary';
import {
  getProducts,
  saveProduct,
  updateProduct,
} from 'app-v3/services/ProductService';
import {useRealm} from 'app-v3/services/realm';
import {colors} from 'app-v3/styles';
import {orderBy} from 'lodash';
import React, {useCallback} from 'react';
import {FlatList, SafeAreaView, Text, View} from 'react-native';
import {applyStyles} from 'app-v3/styles';

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
              summaryTableStyles.row,
              summaryTableItemStyles.row,
            )}>
            <View
              style={applyStyles(
                summaryTableStyles.column,
                summaryTableStyles['column-50'],
              )}>
              <Text style={summaryTableItemStyles.text}>{item.name}</Text>
            </View>
            <View
              style={applyStyles(
                summaryTableStyles['column-25'],
                summaryTableStyles.column,
                {
                  alignItems: 'flex-end',
                },
              )}>
              <Text style={summaryTableItemStyles.text}>
                {amountWithCurrency(item.price)}
              </Text>
            </View>
            <View
              style={applyStyles(
                summaryTableStyles['column-25'],
                summaryTableStyles.column,
                {
                  alignItems: 'flex-end',
                },
              )}>
              <Text style={summaryTableItemStyles.text}>
                {numberWithCommas(item.quantity)}
              </Text>
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
                summaryTableStyles.row,
                summaryTableHeaderStyles.row,
              )}>
              <View
                style={applyStyles(
                  'px-xs',
                  summaryTableStyles.column,
                  summaryTableStyles['column-50'],
                )}>
                <Text style={summaryTableHeaderStyles.text}>Item</Text>
              </View>
              <View
                style={applyStyles(
                  'px-xs',
                  summaryTableStyles.column,
                  summaryTableStyles['column-25'],
                  {
                    alignItems: 'flex-end',
                  },
                )}>
                <Text style={summaryTableHeaderStyles.text}>Sales Price</Text>
              </View>
              <View
                style={applyStyles(
                  'px-xs',
                  summaryTableStyles['column-25'],
                  summaryTableStyles.column,
                  {
                    alignItems: 'flex-end',
                  },
                )}>
                <Text style={summaryTableHeaderStyles.text}>QTY</Text>
              </View>
            </View>
            <Touchable onPress={handleOpenReceiptItemModal}>
              <View
                style={applyStyles(
                  summaryTableStyles.row,
                  summaryTableHeaderStyles.row,
                  {
                    height: 48,
                    borderTopWidth: 0,
                  },
                )}>
                <View
                  style={applyStyles(
                    summaryTableStyles.column,
                    summaryTableStyles['column-50'],
                  )}>
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
                <View
                  style={applyStyles(
                    summaryTableStyles.column,
                    summaryTableStyles['column-25'],
                  )}
                />
                <View
                  style={applyStyles(
                    summaryTableStyles['column-25'],
                    summaryTableStyles.column,
                  )}
                />
              </View>
            </Touchable>
          </>
        }
      />
    </SafeAreaView>
  );
});
