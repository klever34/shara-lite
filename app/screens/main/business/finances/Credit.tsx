import {useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, FAButton} from '../../../../components';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {applyStyles} from '../../../../helpers/utils';
import {getSummary, IFinanceSummary} from '../../../../services/FinanceService';
import {useRealm} from '../../../../services/realm';
import {colors} from '../../../../styles';

export const MyCredit = () => {
  const realm = useRealm();
  const navigation = useNavigation();
  const financeSummary: IFinanceSummary = getSummary({realm});

  const handleNavigation = useCallback(
    (route: string) => {
      navigation.navigate(route);
    },
    [navigation],
  );

  return (
    <View style={applyStyles('flex-1', {backgroundColor: colors['gray-20']})}>
      <View style={applyStyles('p-xl')}>
        <Button
          title="record credit payment"
          style={applyStyles('mb-lg', {width: '100%'})}
          onPress={() => handleNavigation('RecordCreditPayment')}
        />
        <Touchable onPress={() => handleNavigation('TotalCredit')}>
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
              &#8358;{financeSummary.totalCredit}
            </Text>
            <Text
              style={applyStyles('text-400 text-uppercase', {
                color: colors.primary,
              })}>
              View details
            </Text>
          </View>
        </Touchable>
        <Touchable onPress={() => handleNavigation('OverdueCredit')}>
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
              &#8358;{financeSummary.totalCredit}
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
      <FAButton
        style={styles.fabButton}
        onPress={() => navigation.navigate('RecordCreditPayment')}>
        <View style={styles.fabButtonContent}>
          <Icon size={18} name="plus" color="white" type="feathericons" />
        </View>
      </FAButton>
    </View>
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
