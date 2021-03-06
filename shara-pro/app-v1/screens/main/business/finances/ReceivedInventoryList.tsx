import {useNavigation} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import format from 'date-fns/format';
import orderBy from 'lodash/orderBy';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {FAButton} from '../../../../components';
import EmptyState from '../../../../components/EmptyState';
import HeaderRight from '../../../../components/HeaderRight';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {amountWithCurrency, applyStyles} from '../../../../helpers/utils';
import {IReceivedInventory} from '../../../../models/ReceivedInventory';
import {useRealm} from '../../../../services/realm';
import {getReceivedInventories} from '../../../../services/ReceivedInventoryService';
import {colors} from '../../../../styles';
import {ReceivedInventoryDetailsModal} from './ReceivedInventoryDetailsModal';

type InventoryItemProps = {
  item: IReceivedInventory;
};

export function ReceivedInventoryList() {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const inventories = getReceivedInventories({realm});
  const [
    activeInventory,
    setActiveInventory,
  ] = useState<IReceivedInventory | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton
          tintColor={colors.white}
          onPress={() => navigation.navigate('Finances', {screen: 'Inventory'})}
        />
      ),
      headerRight: () => (
        <View>
          <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
        </View>
      ),
    });
  }, [navigation]);

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
                {amountWithCurrency(inventory.total_amount)}
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
        renderItem={renderInventoryItem}
        keyExtractor={(item) => `${item._id}`}
        data={orderBy(inventories, 'created_at', 'desc')}
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
        inventory={activeInventory}
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
    paddingHorizontal: 16,
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
