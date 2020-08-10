import React, {useCallback} from 'react';
import {FlatList, Modal, Text, View} from 'react-native';
import {Button} from '../../../../components';
import {applyStyles} from '../../../../helpers/utils';
import {IStockItem} from '../../../../models/StockItem';
import {colors} from '../../../../styles';
import {
  SummaryTableHeader,
  SummaryTableItem,
  SummaryTableItemProps,
} from './ReceiveInventoryStockSummary';

type Props = {
  visible: boolean;
  onClose: () => void;
  products: IStockItem[];
};

export const ReceiveInventoryStockPreview = (props: Props) => {
  const {visible, products, onClose} = props;

  const renderSummaryItem = useCallback(
    ({item}: SummaryTableItemProps) => <SummaryTableItem item={item} />,
    [],
  );

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
            data={products}
            nestedScrollEnabled
            renderItem={renderSummaryItem}
            keyExtractor={(item, index) => `${item.product.name}-${index}`}
            ListHeaderComponent={SummaryTableHeader}
          />
        </View>
      </View>
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
