import React from 'react';
import {SafeAreaView, Text, View, StyleSheet} from 'react-native';
import {Button} from '../../../components';
import {colors} from '../../../styles';
import {useNavigation} from '@react-navigation/native';
import {numberWithCommas, applyStyles} from '../../../helpers/utils';
import {FlatList} from 'react-native-gesture-handler';
import ActionCard from './ActionCard';
import {format} from 'date-fns/esm';
import {ICustomer} from '../../../models';
import {IPayment} from '../../../models/Payment';

const CreditsTab = ({customer}: {customer: ICustomer}) => {
  const navigation = useNavigation();
  const payments = customer.payments || [];
  const credits = payments.filter(({credit_amount}) => credit_amount > 0);
  const totalCredits = credits.reduce(
    (total, {credit_amount}) => total + credit_amount,
    0,
  );

  const handleViewDetails = (creditDetails: IPayment) => {
    navigation.navigate('CreditPayment', {creditDetails});
  };

  const renderCreditItem = ({item: creditDetails}: {item: IPayment}) => {
    return (
      <View style={styles.creditItem}>
        <ActionCard
          buttonIcon="eye"
          buttonText="view details"
          onClick={() => handleViewDetails(creditDetails)}>
          <View style={applyStyles('pb-sm')}>
            <Text style={styles.itemTitle}>Amount</Text>
            <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
              &#8358;{numberWithCommas(creditDetails.credit_amount)}
            </Text>
          </View>
          <View style={applyStyles('flex-row', 'justify-space-between')}>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Given on</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {format(new Date(creditDetails.created_at), 'MMM dd, yyyy')}
              </Text>
              <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
                {format(new Date(creditDetails.created_at), 'hh:mm:a')}
              </Text>
            </View>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Due on</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {format(new Date(creditDetails.created_at), 'MMM dd, yyyy')}
              </Text>
              <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
                {format(new Date(creditDetails.created_at), 'hh:mm:a')}
              </Text>
            </View>
          </View>
          <View style={applyStyles('pb-sm')}>
            <Text style={styles.itemTitle}>Given by</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              NA
            </Text>
          </View>
        </ActionCard>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={applyStyles('text-400', styles.totalCreditText)}>
          Total Credit
        </Text>
        <Text style={applyStyles('text-700', styles.toalCreditAmount)}>
          &#8358; {numberWithCommas(totalCredits)}
        </Text>
        <Button
          title="record payment"
          style={applyStyles({width: '100%'})}
          onPress={() => navigation.navigate('RecordPayment')}
        />
      </View>
      <FlatList
        data={credits}
        renderItem={renderCreditItem}
        keyExtractor={(item) => item.id}
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

export default CreditsTab;
