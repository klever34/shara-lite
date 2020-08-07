import {useNavigation} from '@react-navigation/native';
import format from 'date-fns/format';
import React, {useCallback, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {FAButton} from '../../../../components';
import EmptyState from '../../../../components/EmptyState';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {amountWithCurrency, applyStyles} from '../../../../helpers/utils';
import {IReceipt} from '../../../../models/Receipt';
import {getReceivedStocks} from '../../../../services/InventoryStockService';
import {useRealm} from '../../../../services/realm';
import {colors} from '../../../../styles';
import {IInventoryStock} from '../../../../models/InventoryStock';
import {ReceivedInventoryDetailsModal} from './ReceivedInventoryDetailsModal';

type InventoryItemProps = {
  item: IInventoryStock;
};

export function ReceivedInventoryList() {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const inventories = getReceivedStocks({realm});
  const [activeInventory, setActiveInventory] = useState<IReceipt | null>(null);

  const handleInventoryItemClick = useCallback((receipt) => {
    setActiveInventory(receipt);
  }, []);

  const handleCloseInventoryDetailsModal = useCallback(() => {
    setActiveInventory(null);
  }, []);

  const renderInventoryItem = useCallback(
    ({item: inventory}: InventoryItemProps) => {
      return (
        <Touchable onPress={() => handleInventoryItemClick(inventory)}>
          <View
            style={applyStyles(
              'px-lg',
              'py-lg',
              'flex-row',
              'justify-space-between',
              {
                borderBottomWidth: 1,
                borderBottomColor: colors['gray-20'],
              },
            )}>
            <View>
              <Text
                style={applyStyles('pb-sm', 'text-400', {
                  fontSize: 16,
                  color: colors['gray-300'],
                })}>
                {inventory.supplier.name}
              </Text>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 12,
                  color: colors['gray-200'],
                })}>
                {inventory.created_at
                  ? format(
                      new Date(inventory.created_at),
                      'MMM dd, yyyy hh:mm:a',
                    )
                  : ''}
              </Text>
            </View>
            <View>
              <Text
                style={applyStyles('pb-sm', 'text-400', {
                  fontSize: 16,
                  color: colors.primary,
                })}>
                {amountWithCurrency(inventory.total_cost_price)}
              </Text>
            </View>
          </View>
        </Touchable>
      );
    },
    [handleInventoryItemClick],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={inventories}
        renderItem={renderInventoryItem}
        keyExtractor={(item) => `${item.id}`}
        ListEmptyComponent={
          <EmptyState
            heading="No inventory received"
            source={require('../../../../assets/images/coming-soon.png')}
            text="Click the button below to receive new inventory"
          />
        }
      />

      <FAButton
        style={styles.fabButton}
        onPress={() => navigation.navigate('ReceiveInventory')}>
        <View style={styles.fabButtonContent}>
          <Icon size={18} name="plus" color="white" type="feathericons" />
        </View>
      </FAButton>
      <ReceivedInventoryDetailsModal
        inventory={[]}
        visible={!!activeInventory}
        onClose={handleCloseInventoryDetailsModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  fabButton: {
    height: 48,
    width: 'auto',
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabButtonText: {
    fontSize: 16,
    paddingLeft: 8,
    color: colors.white,
    textTransform: 'uppercase',
  },
});
