import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {getAnalyticsService} from '@/services';
import {getSummary, IFinanceSummary} from '@/services/FinanceService';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {FloatingAction} from 'react-native-floating-action';
import {ActionCard, Button} from '../../../components';

export const BusinessTab = () => {
  const realm = useRealm();
  const navigation = useNavigation();
  const financeSummary: IFinanceSummary = getSummary({realm});

  const actions = [
    {
      name: 'NewReceipt',
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
              View inventory
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
      name: 'AddProduct',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              Add new product
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/add.png')}
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
              View credit
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
        switch (name) {
          case 'Credit':
            navigation.navigate('Finances', {screen: 'Credit'});
            break;
          case 'Inventory':
            navigation.navigate('Finances', {screen: 'Inventory'});
            break;
          case 'NewReceipt':
            getAnalyticsService()
              .logEvent('receiptStart')
              .then(() => {});
            navigation.navigate(name);
            break;
          case 'AddProduct':
            getAnalyticsService()
              .logEvent('productStart')
              .then(() => {});
            navigation.navigate(name);
            break;

          default:
            navigation.navigate(name);
            break;
        }
      }
    },
    [navigation],
  );

  const handleViewFinances = useCallback(() => {
    navigation.navigate('Finances', {screen: 'FinancesTab'});
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={applyStyles('mb-lg')}>
        <ActionCard
          style={applyStyles(styles.card, {backgroundColor: colors.primary})}>
          <Text
            style={applyStyles(styles.cardTitle, {color: colors['red-50']})}>
            My sales
          </Text>
          <Text style={applyStyles(styles.cardContent, {color: colors.white})}>
            {amountWithCurrency(financeSummary.totalSales)}
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
            {amountWithCurrency(0)}
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
            {amountWithCurrency(0)}
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
            {amountWithCurrency(financeSummary.totalCredit)}
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
            {amountWithCurrency(financeSummary.overdueCredit)}
          </Text>
        </ActionCard>
      </View>
      <Button
        variantColor="white"
        title="View all finances"
        onPress={handleViewFinances}
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
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: colors['gray-10'],
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
