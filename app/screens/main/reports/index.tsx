import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {getSummary, IFinanceSummary} from '@/services/FinanceService';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ActionCard} from '../../../components';

export const ReportsScreen = () => {
  const realm = useRealm();
  const financeSummary: IFinanceSummary = getSummary({realm});

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 16,
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
  card: {
    padding: 16,
    paddingTop: 16,
    elevation: 3,
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
