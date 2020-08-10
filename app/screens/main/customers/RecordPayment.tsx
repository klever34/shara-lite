import React, {useState, useCallback} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {CreditPaymentForm} from '../../../components';
import {useNavigation} from '@react-navigation/native';

const RecordPayment = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    (payload, callback) => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        callback();
        navigation.navigate('CreditsTab');
      }, 300);
    },
    [navigation],
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
