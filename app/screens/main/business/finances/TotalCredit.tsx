import {useNavigation} from '@react-navigation/native';
import format from 'date-fns/format';
import React, {useLayoutEffect} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {ActionCard} from '../../../../components';
import {applyStyles, numberWithCommas} from '../../../../helpers/utils';
import {colors} from '../../../../styles';
import {useRealm} from '../../../../services/realm';
import Touchable from '../../../../components/Touchable';
import Icon from '../../../../components/Icon';
import AppMenu from '../../../../components/Menu';
import EmptyState from '../../../../components/EmptyState';
import {getCredits} from '../../../../services/CreditService';
import {ICredit} from '../../../../models/Credit';

export const TotalCredit = () => {
  const realm = useRealm();
  const navigation = useNavigation();

  const credits = getCredits({realm});

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

  const handleViewDetails = (creditDetails: ICredit) => {
    navigation.navigate('CreditDetails', {creditDetails});
  };

  const renderCreditItem = ({item: creditDetails}: {item: ICredit}) => {
    return (
      <View style={styles.creditItem}>
        <ActionCard
          buttonText="view details"
          onClick={() => handleViewDetails(creditDetails)}>
          <View style={applyStyles('flex-row', 'justify-space-between')}>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Customer</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {creditDetails.customer_name}
              </Text>
            </View>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Amount</Text>
              <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
                &#8358;{numberWithCommas(creditDetails.amount_left)}
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
              <Text
                style={applyStyles(styles.itemDataMedium, 'text-400', {
                  color: colors.primary,
                })}>
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
      style={applyStyles('py-xl', 'flex-1', {
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
  creditItem: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  item: {
    paddingBottom: 16,
  },
  itemTitle: {
    paddingBottom: 2,
    color: colors['gray-100'],
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
