import {
  summaryTableHeaderStyles,
  summaryTableItemStyles,
  summaryTableStyles,
} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {
  amountWithCurrency,
  applyStyles,
  numberWithCommas,
} from '@/helpers/utils';
import {IProduct} from '@/models/Product';
import {ReceiptItemModalContent} from '@/screens/receipt';
import {getAnalyticsService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {
  getProducts,
  saveProduct,
  updateProduct,
} from '@/services/ProductService';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import React, {useCallback} from 'react';
import {FlatList, SafeAreaView, Text, View} from 'react-native';

type Props = ModalWrapperFields;

export const ItemsTab = withModal(({openModal}: Props) => {
  const realm = useRealm();
  const products = getProducts({realm});
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
        data={products}
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
