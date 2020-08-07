import React, {useCallback} from 'react';
import {FlatList, Modal, Text, View} from 'react-native';
import {Button} from '../../../../components';
import {amountWithCurrency, applyStyles} from '../../../../helpers/utils';
import {IInventoryStock} from '../../../../models/InventoryStock';
import {colors} from '../../../../styles';
import {
  SummaryTableHeader,
  summaryTableItemStyles,
  summaryTableStyles,
} from '../receipts';

type Props = {
  visible: boolean;
  onClose: () => void;
  inventory: IInventoryStock;
};

export const ReceivedInventoryDetailsModal = (props: Props) => {
  const {visible, inventory, onClose} = props;

  const renderSummaryItem = useCallback(({item}: {item: IInventoryStock}) => {
    const price = item.price ? item.price : 0;
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
    <Modal animationType="slide" visible={visible}>
      <View style={applyStyles('flex-1', 'px-md')}>
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
          <FlatList
            data={inventory}
            nestedScrollEnabled
            renderItem={renderSummaryItem}
            keyExtractor={(item) => `${item.id}`}
            ListHeaderComponent={SummaryTableHeader}
          />
        </View>
      </View>
      <Button
        variantColor="clear"
        style={applyStyles({width: '100%', marginBottom: 24})}
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
