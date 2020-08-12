import React, {useCallback} from 'react';
import {Modal, Text, View, FlatList} from 'react-native';
import {applyStyles} from '../../../../helpers/utils';
import {Button} from '../../../../components';
import {colors} from '../../../../styles';
import {
  SummaryTableItemProps,
  SummaryTableItem,
  SummaryTableHeader,
} from './ReceiptSummary';
import {IReceiptItem} from '../../../../models/ReceiptItem';

type Props = {
  visible: boolean;
  onClose: () => void;
  products: IReceiptItem[];
};

export const ProductsPreviewModal = (props: Props) => {
  const {visible, products, onClose} = props;

  const renderSummaryItem = useCallback(
    ({item}: SummaryTableItemProps) => <SummaryTableItem item={item} />,
    [],
  );

  return (
    <Modal animationType="slide" visible={visible} onDismiss={onClose}>
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
            keyExtractor={(item) => `${item._id}`}
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
