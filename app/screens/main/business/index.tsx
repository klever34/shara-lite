import {useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {FloatingAction} from 'react-native-floating-action';
import {colors} from '../../../styles';
import {applyStyles, numberWithCommas} from '../../../helpers/utils';
import ActionCard from '../customers/ActionCard';
import {Button} from '../../../components';

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
      <View style={applyStyles('mb-lg')}>
        <ActionCard
          style={applyStyles(styles.card, {backgroundColor: colors.primary})}>
          <Text
            style={applyStyles(styles.cardTitle, {color: colors['red-50']})}>
            Total sales
          </Text>
          <Text style={applyStyles(styles.cardContent, {color: colors.white})}>
            {numberWithCommas(15365400)}
          </Text>
        </ActionCard>
      </View>
      <View style={applyStyles('flex-row', 'mb-lg', 'justify-space-between')}>
        <ActionCard
          style={applyStyles(styles.card, {
            backgroundColor: colors.white,
            width: '48%',
          })}>
          <Text
            style={applyStyles(styles.cardTitle, {color: colors['gray-100']})}>
            Total profit
          </Text>
          <Text
            style={applyStyles(styles.cardContent, {
              color: colors['gray-300'],
            })}>
            {numberWithCommas(15365400)}
          </Text>
        </ActionCard>
        <ActionCard
          style={applyStyles(styles.card, {
            backgroundColor: colors.white,
            width: '48%',
          })}>
          <Text
            style={applyStyles(styles.cardTitle, {color: colors['gray-100']})}>
            Total expenses
          </Text>
          <Text
            style={applyStyles(styles.cardContent, {
              color: colors.primary,
            })}>
            {numberWithCommas(1205400)}
          </Text>
        </ActionCard>
      </View>
      <View style={applyStyles('flex-row', 'mb-lg', 'justify-space-between')}>
        <ActionCard
          style={applyStyles(styles.card, {
            backgroundColor: colors.white,
            width: '48%',
          })}>
          <Text
            style={applyStyles(styles.cardTitle, {color: colors['gray-100']})}>
            Total credit
          </Text>
          <Text
            style={applyStyles(styles.cardContent, {
              color: colors['gray-300'],
            })}>
            {numberWithCommas(14405000)}
          </Text>
        </ActionCard>
        <ActionCard
          style={applyStyles(styles.card, {
            backgroundColor: colors.white,
            width: '48%',
          })}>
          <Text
            style={applyStyles(styles.cardTitle, {color: colors['gray-100']})}>
            Overdue credit
          </Text>
          <Text
            style={applyStyles(styles.cardContent, {color: colors.primary})}>
            {numberWithCommas(15365400)}
          </Text>
        </ActionCard>
      </View>
      <Button
        onPress={() => {}}
        variantColor="white"
        title="View all finances"
        style={applyStyles({elevation: 0})}
      />
      <FloatingAction
        actions={actions}
        distanceToEdge={12}
        color={colors.primary}
        actionsPaddingTopBottom={4}
        onPressItem={handleActionItemClick}
        overlayColor="rgba(255,255,255,0.95)"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    // backgroundColor: colors.white,
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
  card: {
    padding: 16,
    paddingTop: 16,
    elevation: 0,
  },
  cardTitle: {
    fontSize: 12,
    paddingBottom: 4,
    fontFamily: 'Rubik-Medium',
    textTransform: 'uppercase',
  },
  cardContent: {
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
});

export default BusinessTab;
