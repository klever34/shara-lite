import {HeaderBackButton} from '@/components/HeaderBackButton';
import {RecordSaleForm} from '@/components/RecordSaleForm';
import {ToastContext} from '@/components/Toast';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {Alert, SafeAreaView, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {MainStackParamList} from '..';

type EditTransactionScreenProps = {
  route: RouteProp<MainStackParamList, 'EditTransaction'>;
};

export const EditTransactionScreen = (props: EditTransactionScreenProps) => {
  const {route} = props;
  const {transaction} = route.params;
  const navigation = useAppNavigation();
  const {updateTransaction} = useTransaction();
  const {showSuccessToast} = useContext(ToastContext);

  const handleSave = useCallback(
    async (updates) => {
      if (updates.amount_paid || updates.credit_amount) {
        await updateTransaction({updates, transaction});
        showSuccessToast('TRANSACTION UPDATED');
        navigation.goBack();
      } else {
        Alert.alert(
          'Waring',
          'Please enter collected amount or oustanding amount',
        );
      }
    },
    [transaction, updateTransaction, showSuccessToast, navigation],
  );

  return (
    <SafeAreaView style={applyStyles('flex-1 bg-white')}>
      <ScrollView
        style={applyStyles('flex-1')}
        keyboardShouldPersistTaps="always">
        <View
          style={applyStyles(
            'flex-row py-8 pr-16 bg-white items-center justify-between',
            {
              borderBottomWidth: 1.5,
              borderBottomColor: colors['gray-20'],
            },
          )}>
          <HeaderBackButton iconName="arrow-left" />
        </View>
        <View style={applyStyles('px-16')}>
          <View style={applyStyles('pt-16 pb-32')}>
            <Text style={applyStyles('text-gray-300 text-400 text-xl')}>
              Edit Transaction
            </Text>
          </View>
          <RecordSaleForm transaction={transaction} onSubmit={handleSave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
