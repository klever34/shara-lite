import {useNavigation} from '@react-navigation/native';
import format from 'date-fns/format';
import React, {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {FlatList, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, FAButton} from '../../../../components';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {applyStyles, numberWithCommas} from '../../../../helpers/utils';
import {ICreditPayment} from '../../../../models/CreditPayment';
import {getCreditPayments} from '../../../../services/CreditPaymentService';
import {getSummary, IFinanceSummary} from '../../../../services/FinanceService';
import {useRealm} from '../../../../services/realm';
import {colors} from '../../../../styles';
import {getCredits} from '../../../../services/CreditService';

type CreditItemProps = {
  item: ICreditPayment;
};

export const MyCredit = () => {
  const realm = useRealm();
  const navigation = useNavigation();
  const financeSummary: IFinanceSummary = getSummary({realm});
  const credits = getCredits({realm});
  const creditsPayments = getCreditPayments({realm});
  const overdueCredit = credits.filter(({amount_left}) => amount_left > 0);
  const paymentMethodLabel = {
    cash: 'Cash',
    transfer: 'Bank Transfer',
    mobile: 'Mobile Money',
  } as {[key: string]: string};

  const handleNavigation = useCallback(
    (route: string, options?: object) => {
      navigation.navigate(route, options);
    },
    [navigation],
  );

  const handleCreditItemClick = useCallback(
    (creditPaymentDetails) => {
      navigation.navigate('CreditPaymentDetails', {creditPaymentDetails});
    },
    [navigation],
  );

  const renderCreditItem = useCallback(
    ({item}: CreditItemProps) => {
      return (
        <Touchable onPress={() => handleCreditItemClick(item)}>
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
                {item.credit?.customer?.name}
              </Text>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 16,
                  color: colors['gray-200'],
                })}>
                {item.created_at && format(item.created_at, 'MMM dd, yyyy')}
              </Text>
            </View>
            <View style={applyStyles({alignItems: 'flex-end'})}>
              <Text
                style={applyStyles('pb-sm', 'text-400', {
                  fontSize: 16,
                  color: colors.primary,
                })}>
                &#8358;{numberWithCommas(item.amount_paid)}
              </Text>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 14,
                  color: colors['gray-200'],
                })}>
                {paymentMethodLabel[item.payment.method]}
              </Text>
            </View>
          </View>
        </Touchable>
      );
    },
    [handleCreditItemClick, paymentMethodLabel],
  );

  return (
    <>
      <ScrollView
        style={applyStyles('flex-1', {backgroundColor: colors['gray-10']})}>
        <View style={applyStyles('p-xl')}>
          <Button
            title="record credit payment"
            style={applyStyles('mb-lg', {width: '100%'})}
            onPress={() => handleNavigation('RecordCreditPayment')}
          />
          <Touchable
            onPress={() =>
              handleNavigation('TotalCredit', {
                credits,
              })
            }>
            <View
              style={applyStyles('w-full p-lg mb-lg', {
                elevation: 3,
                borderRadius: 8,
                backgroundColor: colors.white,
              })}>
              <Text
                style={applyStyles('text-400 text-uppercase', {
                  color: colors['gray-200'],
                })}>
                You are being owed
              </Text>
              <Text
                style={applyStyles('pb-xs text-700', {
                  fontSize: 24,
                  color: colors['gray-300'],
                })}>
                &#8358;{numberWithCommas(financeSummary.overdueCredit)}
              </Text>
              <Text
                style={applyStyles('text-400 text-uppercase', {
                  color: colors.primary,
                })}>
                View details
              </Text>
            </View>
          </Touchable>
          <Touchable
            onPress={() =>
              handleNavigation('OverdueCredit', {
                credits: overdueCredit,
              })
            }>
            <View
              style={applyStyles('w-full p-lg mb-lg', {
                elevation: 3,
                borderRadius: 8,
                backgroundColor: colors.white,
              })}>
              <Text
                style={applyStyles('text-400 text-uppercase', {
                  color: colors['gray-200'],
                })}>
                You are to collect
              </Text>
              <Text
                style={applyStyles('pb-xs text-700', {
                  fontSize: 24,
                  color: colors.primary,
                })}>
                &#8358;{numberWithCommas(financeSummary.overdueCredit)}
              </Text>
              <Text
                style={applyStyles('text-400 text-uppercase', {
                  color: colors.primary,
                })}>
                View details
              </Text>
            </View>
          </Touchable>
        </View>
        {!!creditsPayments.length && (
          <View style={applyStyles('h-full', {backgroundColor: colors.white})}>
            <Text
              style={applyStyles('text-500 py-xs px-lg', {
                borderBottomWidth: 1,
                color: colors['gray-300'],
                borderBottomColor: colors['gray-20'],
              })}>
              Payment History
            </Text>
            <FlatList
              data={creditsPayments}
              renderItem={renderCreditItem}
              keyExtractor={(item) => `${item.id}`}
            />
          </View>
        )}
      </ScrollView>

      <FAButton
        style={styles.fabButton}
        onPress={() => navigation.navigate('RecordCreditPayment')}>
        <View style={styles.fabButtonContent}>
          <Icon size={18} name="plus" color="white" type="feathericons" />
        </View>
      </FAButton>
    </>
  );
};

const styles = StyleSheet.create({
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
