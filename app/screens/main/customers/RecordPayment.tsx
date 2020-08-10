import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {CreditPaymentForm} from '../../../components';
import {saveCreditPayment} from '../../../services/CreditPaymentService';
import {useRealm} from '../../../services/realm';

const RecordPayment = ({route}: any) => {
  const realm = useRealm();
  const {customer} = route.params;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    (payload, callback) => {
      const {amount, method} = payload;
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        saveCreditPayment({
          realm,
          method,
          customer,
          amount: parseFloat(amount),
        });
        callback();
        navigation.navigate('CreditsTab');
      }, 300);
    },
    [realm, customer, navigation],
  );

  return (
    <SafeAreaView style={styles.container}>
      <CreditPaymentForm isLoading={isLoading} onSubmit={handleSubmit} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 54,
    paddingHorizontal: 16,
  },
});

export default RecordPayment;
