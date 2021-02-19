import React, {useCallback} from 'react';
import {FlatList, SafeAreaView, View} from 'react-native';
import {applyStyles, as, colors} from '@/styles';
import {Button, Text} from '@/components';
import {Icon} from '@/components/Icon';
import {getI18nService} from '@/services';
import {amountWithCurrency} from '@/helpers/utils';
import {useClipboard} from '@/helpers/hooks';
import EmptyState from '@/components/EmptyState';
import {useAppNavigation} from '@/services/navigation';
import {MoneyActionsContainer} from './MoneyActionsContainer';
import Emblem from '@/assets/images/emblem-gray.svg';
import {withModal} from '@/helpers/hocs';
import {MoneyDepositScreen} from '@/screens/main/money/MoneyDepositScreen';
import MoneyWithdrawModal from '@/screens/main/money/MoneyWithdrawModal';
import {useWallet} from '@/services/wallet';

const strings = getI18nService().strings;

export const PaymentActivitiesScreen = withModal(({openModal, closeModal}) => {
  const navigation = useAppNavigation();
  const {copyToClipboard} = useClipboard();
  // const [searchTerm] = useState('');
  // const handleSearch = useCallback((text: string) => {
  //   console.log(text);
  // }, []);
  // const handleOpenFilterModal = useCallback(() => {}, []);
  const totalReceivedAmount = 0;
  const totalWithdrawnAmount = 0;
  const {getWallet} = useWallet();
  const wallet = getWallet();
  const walletBalance = wallet?.balance;
  const merchantId = wallet?.merchant_id;
  const handleCopyMerchantId = useCallback(() => {
    copyToClipboard(String(merchantId));
  }, [copyToClipboard, merchantId]);
  const handleDeposit = useCallback(() => {
    openModal('bottom-half', {
      renderContent: () => <MoneyDepositScreen onClose={closeModal} />,
      showHandleNub: false,
    });
  }, [closeModal, openModal]);
  const handleWithdraw = useCallback(() => {
    openModal('bottom-half', {
      renderContent: () => <MoneyWithdrawModal onClose={closeModal} />,
      showHandleNub: false,
    });
  }, [closeModal, openModal]);
  // TODO: Add logic to check whether money settings is set up
  const moneySettingsNotSetup = false;
  const onGoToMoneySettings = useCallback(() => {
    navigation.navigate('PaymentSettings');
  }, [navigation]);
  const handleDrawdown = useCallback(() => {
    navigation.navigate('Drawdown');
  }, [navigation]);
  const renderListItem = useCallback(() => null, []);

  if (moneySettingsNotSetup) {
    return (
      <SafeAreaView style={applyStyles('flex-1 bg-white')}>
        <View style={as('flex-1 center px-32')}>
          <Emblem width={64} height={64} />
          <Text style={as('text-center mt-24 mb-32 text-gray-200')}>
            {strings('payment_activities.empty_state.description')}
          </Text>
          <Button
            title={strings('payment_activities.empty_state.tag')}
            style={as('w-full')}
            onPress={onGoToMoneySettings}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={applyStyles('flex-1 bg-white')}>
      {/*<View*/}
      {/*  style={applyStyles('pr-8 flex-row items-center justify-between', {*/}
      {/*    borderBottomWidth: 1.5,*/}
      {/*    borderBottomColor: colors['gray-20'],*/}
      {/*  })}>*/}
      {/*  <SearchFilter*/}
      {/*    value={searchTerm}*/}
      {/*    onSearch={handleSearch}*/}
      {/*    containerStyle={applyStyles('flex-1')}*/}
      {/*    onClearInput={() => handleSearch('')}*/}
      {/*    placeholderText={strings('payment_activities.search_placeholder')}*/}
      {/*  />*/}
      {/*  {!searchTerm && (*/}
      {/*    <Touchable onPress={handleOpenFilterModal}>*/}
      {/*      <View*/}
      {/*        style={applyStyles('py-4 px-8 flex-row items-center', {*/}
      {/*          borderWidth: 1,*/}
      {/*          borderRadius: 4,*/}
      {/*          borderColor: colors['gray-20'],*/}
      {/*        })}>*/}
      {/*        <Text style={applyStyles('text-gray-200 text-700 pr-8')}>*/}
      {/*          {strings('filter', {count: 2})}*/}
      {/*        </Text>*/}
      {/*        <Icon*/}
      {/*          size={16}*/}
      {/*          name="calendar"*/}
      {/*          type="feathericons"*/}
      {/*          color={colors['gray-50']}*/}
      {/*        />*/}
      {/*      </View>*/}
      {/*    </Touchable>*/}
      {/*  )}*/}
      {/*</View>*/}
      <View
        style={as(
          'flex-row justify-between py-12 border-b-1 border-b-gray-20 px-12',
          {borderBottomWidth: 1.5},
        )}>
        <View style={as('flex-row items-center')}>
          <Icon
            type="feathericons"
            name="arrow-down"
            color={colors['green-200']}
            style={as('mr-4')}
            size={16}
          />
          <Text style={as('')}>
            {strings('payment_activities.received')}:{' '}
            <Text style={as('font-bold')}>
              {amountWithCurrency(totalReceivedAmount)}
            </Text>
          </Text>
        </View>
        <View style={as('flex-row items-center')}>
          <Icon
            type="feathericons"
            name="arrow-up"
            color={colors['red-100']}
            style={as('mr-4')}
            size={16}
          />
          <Text style={as('')}>
            {strings('payment_activities.withdrawn')}:{' '}
            <Text style={as('font-bold')}>
              {amountWithCurrency(totalWithdrawnAmount)}
            </Text>
          </Text>
        </View>
        <View />
      </View>
      <MoneyActionsContainer
        figure={{
          label: strings('payment_activities.your_wallet_balance'),
          value: amountWithCurrency(walletBalance),
        }}
        tag={
          !merchantId
            ? undefined
            : {
                label: strings('payment_activities.merchant_id', {
                  merchant_id: merchantId,
                }),
                onPress: handleCopyMerchantId,
                pressInfo: strings('payment_activities.tap_to_copy'),
              }
        }
        actions={[
          {
            icon: {
              name: 'plus',
              color: colors['green-200'],
              bgColor: colors['green-50'],
            },
            onPress: handleDeposit,
            label: strings('payment_activities.deposit'),
          },
          {
            icon: {
              name: 'arrow-up',
              color: colors['red-100'],
              bgColor: colors['red-10'],
            },
            onPress: handleWithdraw,
            label: strings('payment_activities.withdraw'),
          },
          {
            icon: {
              name: 'dollar-sign',
              color: colors['blue-100'],
              bgColor: colors['blue-10'],
            },
            onPress: handleDrawdown,
            label: strings('payment_activities.drawdown'),
          },
        ]}
      />
      <FlatList
        data={[]}
        initialNumToRender={10}
        style={applyStyles('bg-white')}
        renderItem={renderListItem}
        contentContainerStyle={as('flex-1')}
        ListHeaderComponent={
          <View
            style={applyStyles(
              'px-16 py-12 flex-row bg-gray-10 justify-between items-center',
            )}>
            <Text style={applyStyles('text-base text-gray-300')}>
              {strings('payment_activities.money_activities')}
            </Text>
            {/*<Touchable onPress={handleOpenFilterModal}>*/}
            {/*  <View style={applyStyles('py-4 px-8 flex-row items-center')}>*/}
            {/*    <Text*/}
            {/*      style={applyStyles(*/}
            {/*        'text-base text-gray-300 text-700 text-uppercase pr-8',*/}
            {/*      )}>*/}
            {/*      All Time*/}
            {/*    </Text>*/}
            {/*    <Icon*/}
            {/*      size={16}*/}
            {/*      type="feathericons"*/}
            {/*      name="chevron-down"*/}
            {/*      color={colors['gray-50']}*/}
            {/*    />*/}
            {/*  </View>*/}
            {/*</Touchable>*/}
          </View>
        }
        ListEmptyComponent={
          <EmptyState>
            <View style={applyStyles('center px-8')}>
              <Text style={applyStyles('text-gray-50 text-sm text-center')}>
                {strings('payment_activities.no_money_activities')}
              </Text>
            </View>
          </EmptyState>
        }
      />
    </SafeAreaView>
  );
});
