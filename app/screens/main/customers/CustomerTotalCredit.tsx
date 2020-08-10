import {useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import format from 'date-fns/format';
import orderBy from 'lodash/orderBy';
import React, {useLayoutEffect} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {ActionCard} from '../../../components';
import EmptyState from '../../../components/EmptyState';
import HeaderRight from '../../../components/HeaderRight';
import Icon from '../../../components/Icon';
import Touchable from '../../../components/Touchable';
import {amountWithCurrency, applyStyles} from '../../../helpers/utils';
import {ICredit} from '../../../models/Credit';
import {colors} from '../../../styles';
import {MainStackParamList} from '../index';
import {useScreenRecord} from '../../../services/analytics';

export const CustomerTotalCredit = ({
  route,
}: StackScreenProps<MainStackParamList, 'CustomerTotalCredit'>) => {
  useScreenRecord();
  const navigation = useNavigation();

  const credits = route.params.credits;

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
            <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
          </View>
        </View>
      ),
    });
  }, [navigation]);

  const handleViewDetails = (creditDetails: ICredit) => {
    navigation.navigate('CustomerCreditDetails', {creditDetails});
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
                {creditDetails.customer?.name}
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
            source={require('../../../assets/images/coming-soon.png')}
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
