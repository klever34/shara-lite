import {useNavigation} from '@react-navigation/native';
import format from 'date-fns/format';
import React, {useLayoutEffect} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {ActionCard} from '../../../../components';
import {applyStyles, numberWithCommas} from '../../../../helpers/utils';
import {ICreditPayment} from '../../../../models/CreditPayment';
import {colors} from '../../../../styles';
import {getCreditPayments} from './../../../../services/CreditPaymentService';
import {useRealm} from '../../../../services/realm';
import Touchable from '../../../../components/Touchable';
import Icon from '../../../../components/Icon';
import AppMenu from '../../../../components/Menu';
import EmptyState from '../../../../components/EmptyState';

export const TotalCredit = () => {
  const realm = useRealm();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={applyStyles('flex-row flex-1 items-center')}>
          <Touchable onPress={() => {}}>
            <View style={applyStyles('px-xs', {width: '33%'})}>
              <Icon
                size={24}
                name="sliders"
                type="feathericons"
                color={colors.white}
              />
            </View>
          </Touchable>
          <Touchable onPress={() => {}}>
            <View style={applyStyles('px-xs', {width: '33%'})}>
              <Icon
                size={24}
                name="search"
                type="feathericons"
                color={colors.white}
              />
            </View>
          </Touchable>
          <View style={applyStyles('px-xs', {width: '33%'})}>
            <AppMenu options={[{text: 'Help', onSelect: () => {}}]} />
          </View>
        </View>
      ),
    });
  }, [navigation]);

  const credits = getCreditPayments({realm});

  const handleViewDetails = (creditDetails: ICreditPayment) => {
    navigation.navigate('CreditDetils', {creditDetails});
  };

  const renderCreditItem = ({item: creditDetails}: {item: ICreditPayment}) => {
    return (
      <View style={styles.creditItem}>
        <ActionCard
          buttonIcon="eye"
          buttonText="view details"
          onClick={() => handleViewDetails(creditDetails)}>
          <View style={applyStyles('flex-row', 'justify-space-between')}>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Customer</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {creditDetails.credit.customer_name}
              </Text>
            </View>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Amount</Text>
              <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
                &#8358;{numberWithCommas(creditDetails.credit.amount_left)}
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
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Due on</Text>
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
          </View>
        </ActionCard>
      </View>
    );
  };
  return (
    <SafeAreaView
      style={applyStyles('flex-1', {
        backgroundColor: colors['gray-20'],
      })}>
      <FlatList
        data={credits}
        renderItem={renderCreditItem}
        keyExtractor={(item) => `${item.id}`}
        ListEmptyComponent={
          <EmptyState
            heading="No credit"
            style={applyStyles({marginTop: 32})}
            source={require('../../../../assets/images/coming-soon.png')}>
            <Touchable
              onPress={() => navigation.navigate('RecordCreditPayment')}>
              <View
                style={applyStyles(
                  'p-lg w-full flex-row items-center justify-center',
                )}>
                <Text
                  style={applyStyles('text-400 text-center text-uppercase', {
                    fontSize: 16,
                    color: colors.primary,
                  })}>
                  Record credit payment
                </Text>
              </View>
            </Touchable>
          </EmptyState>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
    backgroundColor: colors['gray-10'],
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  totalCreditText: {
    paddingBottom: 4,
    color: colors.primary,
  },
  toalCreditAmount: {
    fontSize: 24,
    paddingBottom: 12,
    color: colors['gray-300'],
  },
  creditItem: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  item: {
    paddingBottom: 16,
  },
  itemTitle: {
    paddingBottom: 2,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  itemDataLarge: {
    fontSize: 18,
    color: colors['gray-300'],
  },
  itemDataMedium: {
    fontSize: 16,
  },
  itemDataSmall: {
    fontSize: 12,
  },
});
