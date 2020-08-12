import format from 'date-fns/format';
import React, {useCallback} from 'react';
import {FlatList, Modal, ScrollView, Text, View} from 'react-native';
import {Button} from '../../../../components';
import {amountWithCurrency, applyStyles} from '../../../../helpers/utils';
import {IReceivedInventory} from '../../../../models/ReceivedInventory';
import {IStockItem} from '../../../../models/StockItem';
import {colors} from '../../../../styles';
import {
  SummaryTableHeader,
  summaryTableItemStyles,
  summaryTableStyles,
} from '../receipts';

type Props = {
  visible: boolean;
  onClose: () => void;
  inventory: IReceivedInventory | null;
};

export const ReceivedInventoryDetailsModal = (props: Props) => {
  const {visible, inventory, onClose} = props;
  const tax = 0;

  const renderSummaryItem = useCallback(({item}: {item: IStockItem}) => {
    const price = item.cost_price ? item.cost_price : 0;
    const quantity = item.quantity ? item.quantity : 0;
    const subtotal = price * quantity;

    return (
      <View
        style={applyStyles(summaryTableStyles.row, summaryTableItemStyles.row)}>
        <View style={summaryTableStyles['column-40']}>
          <Text style={summaryTableItemStyles.text}>
            {item.product.name} {item.product.weight ? `(${item.weight})` : ''}
          </Text>
          <Text style={summaryTableItemStyles.subText}>
            {amountWithCurrency(price)} Per Unit
          </Text>
        </View>
        <View
          style={applyStyles(summaryTableStyles['column-20'], {
            alignItems: 'flex-end',
          })}>
          <Text style={summaryTableItemStyles.text}>{quantity}</Text>
        </View>
        <View
          style={applyStyles(summaryTableStyles['column-40'], {
            alignItems: 'flex-end',
          })}>
          <Text style={summaryTableItemStyles.text}>
            {amountWithCurrency(subtotal)}
          </Text>
        </View>
      </View>
    );
  }, []);

  return (
    <Modal animationType="slide" visible={visible} onDismiss={onClose}>
      <ScrollView style={applyStyles('flex-1', 'px-md')}>
        <View style={applyStyles('flex-1')}>
          <View style={applyStyles({marginVertical: 32})}>
            <Text
              style={applyStyles('text-500', 'pb-xs', {
                fontSize: 18,
                color: colors.primary,
              })}>
              Products Preview
            </Text>
            <Text style={applyStyles('text-400', {color: colors['gray-200']})}>
              Here is a list of products being purchased
            </Text>
          </View>
          <View
            style={applyStyles('mb-md flex-row w-full justify-space-between')}>
            <View>
              <Text
                style={applyStyles('pb-xs text-400 text-uppercase', {
                  color: colors['gray-100'],
                })}>
                Supplier
              </Text>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 16,
                  color: colors['gray-300'],
                })}>
                {inventory?.supplier.name}
              </Text>
            </View>
            <View>
              <Text
                style={applyStyles('pb-xs text-400 text-uppercase', {
                  color: colors['gray-100'],
                })}>
                Supplied on
              </Text>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 16,
                  color: colors['gray-300'],
                })}>
                {inventory?.created_at
                  ? format(new Date(inventory.created_at), 'MMM dd, yyyy')
                  : ''}
              </Text>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 12,
                  color: colors['gray-300'],
                })}>
                {inventory?.created_at
                  ? format(new Date(inventory.created_at), 'hh:mm:a')
                  : ''}
              </Text>
            </View>
          </View>
          <View
            style={applyStyles('flex-row w-full justify-space-between', {
              marginBottom: 48,
            })}>
            <View>
              <Text
                style={applyStyles('pb-xs text-400 text-uppercase', {
                  color: colors['gray-100'],
                })}>
                Delivery Agent
              </Text>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 16,
                  color: colors['gray-300'],
                })}>
                {inventory?.delivery_agent
                  ? inventory?.delivery_agent?.full_name
                  : 'No Delivery Agent'}
              </Text>
            </View>
          </View>

          <FlatList
            nestedScrollEnabled
            renderItem={renderSummaryItem}
            data={inventory?.suppliedStockItems}
            keyExtractor={(item) => `${item._id}`}
            ListHeaderComponent={SummaryTableHeader}
          />
          <View style={applyStyles('mb-md items-end')}>
            <View style={applyStyles({width: '60%'})}>
              <View
                style={applyStyles(
                  'pb-sm',
                  'flex-row',
                  'items-center',
                  'justify-space-between',
                )}>
                <Text
                  style={applyStyles('text-400', {
                    color: colors['gray-300'],
                  })}>
                  Tax:
                </Text>
                <Text
                  style={applyStyles('text-400', {
                    color: colors['gray-300'],
                  })}>
                  {tax}
                </Text>
              </View>
              <View
                style={applyStyles(
                  'flex-row',
                  'items-center',
                  'justify-space-between',
                )}>
                <Text
                  style={applyStyles(
                    {
                      color: colors['gray-300'],
                    },
                    'text-400',
                  )}>
                  Total:
                </Text>
                <Text
                  style={applyStyles('text-500', {
                    fontSize: 18,
                    color: colors['gray-300'],
                  })}>
                  {amountWithCurrency(inventory?.total_amount)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <Button
        variantColor="clear"
        style={applyStyles('w-full mb-xl', {
          borderTopColor: colors['gray-20'],
          borderTopWidth: 1,
        })}
        onPress={onClose}>
        <Text
          style={applyStyles('text-400', 'text-uppercase', {
            color: colors['gray-200'],
          })}>
          Close
        </Text>
      </Button>
    </Modal>
  );
};
