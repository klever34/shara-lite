import Touchable from '@/components/Touchable';
import {getAuthService} from '@/services';
import {getCredits} from '@/services/CreditService';
import {useRealm} from '@/services/realm';
import {getAllPayments} from '@/services/ReceiptService';
import {useNavigation} from '@react-navigation/native';
import format from 'date-fns/format';
import orderBy from 'lodash/orderBy';
import React, {useCallback, useLayoutEffect} from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Share from 'react-native-share';
import {ActionCard} from '../../../../components';
import EmptyState from '../../../../components/EmptyState';
import HeaderRight from '../../../../components/HeaderRight';
import {amountWithCurrency, applyStyles} from '../../../../helpers/utils';
import {ICredit} from '../../../../models/Credit';
import {useScreenRecord} from '../../../../services/analytics';
import {colors} from '../../../../styles';

export const OverdueCredit = () => {
  useScreenRecord();
  const realm = useRealm();
  const today = new Date();
  const navigation = useNavigation();
  const user = getAuthService().getUser();
  const allCredits = getCredits({realm});
  const credits = allCredits.filter(
    ({fulfilled, due_date}) =>
      !fulfilled && due_date && due_date.getTime() < today.getTime(),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  const handleViewDetails = (creditDetails: ICredit) => {
    navigation.navigate('CreditDetails', {creditDetails});
  };

  const handleSmsShare = useCallback(
    async (credit: ICredit) => {
      const allPayments = credit.receipt
        ? getAllPayments({receipt: credit.receipt})
        : [];
      const totalAmountPaid = allPayments.reduce(
        (total, payment) => total + payment.amount_paid,
        0,
      );
      const creditAmountLeft = credit?.receipt?.credits?.reduce(
        (acc, item) => acc + item.amount_left,
        0,
      );
      const shareOptions = {
        // @ts-ignore
        social: Share.Social.SMS,
        title: 'Payment Reminder',
        message: `Hello, you purchased some items from ${
          user?.businesses[0]?.name
        } for ${amountWithCurrency(
          credit.receipt?.total_amount,
        )}. You paid ${amountWithCurrency(
          totalAmountPaid,
        )} and owe ${amountWithCurrency(creditAmountLeft)} which is due on ${
          credit.due_date
            ? format(new Date(credit.due_date), 'MMM dd, yyyy')
            : ''
        }. Don't forget to make payment.\n\nPowered by Shara for free.\nhttp://shara.co`,
        recipient: `${credit.customer?.mobile}`,
      };

      try {
        await Share.shareSingle(shareOptions);
      } catch (e) {
        Alert.alert('Error', e.error);
      }
    },
    [user],
  );

  const renderCreditItem = ({item: creditDetails}: {item: ICredit}) => {
    const hasCustomer = creditDetails.customer?.mobile;

    return (
      <View style={styles.creditItem}>
        <ActionCard>
          <View style={applyStyles('flex-row', 'justify-space-between')}>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Customer</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {creditDetails.customer?.name || 'No Customer'}
              </Text>
            </View>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Amount</Text>
              <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
                {amountWithCurrency(creditDetails.amount_left)}
              </Text>
            </View>
          </View>
          <View style={applyStyles('flex-row', 'justify-space-between')}>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Given on</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {creditDetails.created_at
                  ? format(new Date(creditDetails.created_at), 'MMM dd, yyyy')
                  : ''}
              </Text>
              <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
                {creditDetails.created_at
                  ? format(new Date(creditDetails.created_at), 'hh:mm:a')
                  : ''}
              </Text>
            </View>
            {creditDetails.due_date && (
              <View style={applyStyles('pb-sm', {width: '48%'})}>
                <Text style={styles.itemTitle}>Due on</Text>
                <Text
                  style={applyStyles(styles.itemDataMedium, 'text-400', {
                    color: colors.primary,
                  })}>
                  {creditDetails.due_date
                    ? format(new Date(creditDetails.due_date), 'MMM dd, yyyy')
                    : ''}
                </Text>
                <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
                  {creditDetails.due_date
                    ? format(new Date(creditDetails.due_date), 'hh:mm:a')
                    : ''}
                </Text>
              </View>
            )}
          </View>

          <View
            style={applyStyles('flex-row items-center justify-space-between', {
              borderTopWidth: 1,
              borderTopColor: colors['gray-20'],
            })}>
            <Touchable onPress={() => handleViewDetails(creditDetails)}>
              <View
                style={applyStyles('items-center justify-center', {
                  height: 60,
                  width: hasCustomer ? '48%' : '100%',
                })}>
                <Text
                  style={applyStyles('text-400 text-uppercase', {
                    color: colors.primary,
                  })}>
                  view details
                </Text>
              </View>
            </Touchable>
            {hasCustomer && (
              <Touchable onPress={() => handleSmsShare(creditDetails)}>
                <View
                  style={applyStyles('items-center justify-center', {
                    height: 60,
                    width: '48%',
                    borderLeftWidth: 1,
                    borderLeftColor: colors['gray-20'],
                  })}>
                  <Text
                    style={applyStyles('text-400 text-uppercase', {
                      color: colors.primary,
                    })}>
                    Send a reminder
                  </Text>
                </View>
              </Touchable>
            )}
          </View>
        </ActionCard>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={applyStyles('py-xl', 'flex-1', {
        backgroundColor: colors['gray-20'],
      })}>
      <FlatList
        data={orderBy(credits, 'created_at', 'desc')}
        renderItem={renderCreditItem}
        keyExtractor={(item) => `${item._id}`}
        ListEmptyComponent={
          <EmptyState
            heading="No credit"
            style={applyStyles({marginTop: 32})}
            source={require('../../../../assets/images/coming-soon.png')}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  creditItem: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  itemTitle: {
    paddingBottom: 2,
    color: colors['gray-200'],
    textTransform: 'uppercase',
  },
  itemDataLarge: {
    fontSize: 18,
    color: colors['gray-300'],
  },
  itemDataMedium: {
    fontSize: 16,
    color: colors['gray-300'],
  },
  itemDataSmall: {
    fontSize: 12,
    color: colors['gray-300'],
  },
});
