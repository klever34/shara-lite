import {useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {FloatingAction} from 'react-native-floating-action';
import {colors} from '../../../styles';
import {applyStyles} from '../../../helpers/utils';

const BusinessTab = () => {
  const navigation = useNavigation();
  const actions = [
    {
      name: 'Receipts',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              Issue a receipt
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/receipts.png')}
            />
          </View>
        );
      },
    },
    {
      name: 'Inventory',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              Record inventory
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/inventory.png')}
            />
          </View>
        );
      },
    },
    {
      name: 'Expenses',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              Record expenses
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/expenses.png')}
            />
          </View>
        );
      },
    },
    {
      name: 'Credit',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              Give Credit
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/credit.png')}
            />
          </View>
        );
      },
    },
  ];

  const handleActionItemClick = useCallback(
    (name?: string) => {
      if (name) {
        navigation.navigate(name);
      }
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <FloatingAction
        actions={actions}
        color={colors.primary}
        actionsPaddingTopBottom={4}
        onPressItem={handleActionItemClick}
        overlayColor="rgba(255,255,255,0.95)"
        distanceToEdge={{vertical: 20, horizontal: 12}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  listItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  listItemIcon: {
    height: 45,
    width: 45,
  },
  listItemText: {
    fontSize: 16,
    paddingRight: 12,
    color: colors['gray-300'],
  },
  fabButton: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabButtonText: {
    fontSize: 16,
    color: colors.white,
  },
});

export default BusinessTab;
