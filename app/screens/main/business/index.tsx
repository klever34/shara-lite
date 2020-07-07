import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {FloatingAction} from 'react-native-floating-action';
import {colors} from '../../../styles';

const BusinessTab = () => {
  const navigation = useNavigation();
  const actions = [
    {
      name: 'Finances',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>Finances</Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/finances.png')}
            />
          </View>
        );
      },
    },
    {
      name: 'Receipts',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>Issue a receipt</Text>
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
            <Text style={styles.listItemText}>Record inventory</Text>
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
            <Text style={styles.listItemText}>Record expenses</Text>
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
            <Text style={styles.listItemText}>Give Credit</Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/credit.png')}
            />
          </View>
        );
      },
    },
  ];
  return (
    <View style={styles.container}>
      <FloatingAction
        animated={false}
        actions={actions}
        distanceToEdge={12}
        color={colors.primary}
        showBackground={false}
        actionsPaddingTopBottom={4}
        onPressItem={(name) => name && navigation.navigate(name)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
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
    fontWeight: '500',
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
