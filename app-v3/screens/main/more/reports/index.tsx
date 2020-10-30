import {amountWithCurrency} from 'app-v3/helpers/utils';
import {getSummary, IFinanceSummary} from 'app-v3/services/FinanceService';
import {useRealm} from 'app-v3/services/realm';
import {colors} from 'app-v3/styles';
import React, {useCallback} from 'react';
import {Alert, StyleSheet, Text, ToastAndroid, View} from 'react-native';
import {ActionCard, Button} from 'app-v3/components';
import {useReports} from 'app-v3/services/reports';
import {applyStyles} from 'app-v3/styles';

export const ReportsScreen = () => {
  const realm = useRealm();
  const {exportReportsToExcel} = useReports();
  const financeSummary: IFinanceSummary = getSummary({realm});

  const handleExport = useCallback(async () => {
    try {
      await exportReportsToExcel();
      ToastAndroid.show('Report exported successfully', ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [exportReportsToExcel]);

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
      <View style={applyStyles('flex-row', 'mb-lg', 'justify-between')}>
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
      <View style={applyStyles('mb-lg')}>
        <Button
          variantColor="red"
          onPress={handleExport}
          title="Export to xlsx"
          style={applyStyles({
            marginBottom: 24,
          })}
        />
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
