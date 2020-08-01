import React, {useState, useCallback} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {CreditPaymentForm} from '../../../../components';
import {useNavigation} from '@react-navigation/native';
import {saveCreditPayment} from '../../../../services/CreditPaymentService';
import {useRealm} from '../../../../services/realm';

export const RecordCreditPayment = () => {
  const realm = useRealm();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    (payload, callback) => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        saveCreditPayment({realm, customer: {}, ...payload});
        callback();
        navigation.goBack();
      }, 300);
    },
    [realm, navigation],
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
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
});
