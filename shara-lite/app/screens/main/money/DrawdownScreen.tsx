import React, {useCallback} from 'react';
import {Page} from '@/components/Page';
import {FlatList, View} from 'react-native';
import {amountWithCurrency} from '@/helpers/utils';
import {applyStyles, as, colors} from '@/styles';
import {MoneyActionsContainer} from '@/screens/main/money/MoneyActionsContainer';
import {getI18nService} from '@/services';
import {Text, TabBar} from '@/components';
import EmptyState from '@/components/EmptyState';
import {withModal} from '@/helpers/hocs';
import {AmountForm} from '@/screens/main/money/AmountForm';

const strings = getI18nService().strings;

export const DrawdownScreen = withModal(({openModal, closeModal}) => {
  const availableDrawdownAmount = 0;
  const amountOwed = 0;
  const walletBalance = 1000000;
  const transactionFee = 5000;
  const totalRepaymentAmount = 105000;

  const handleTakeDrawdown = useCallback(() => {
    openModal('bottom-half', {
      renderContent: () => (
        <AmountForm
          header={{
            title: strings('drawdown.take_drawdown'),
          }}
          leadText={strings('drawdown.take_drawdown_lead_text')}
          onClose={closeModal}
          actionItems={[
            {
              icon: 'calendar',
              leftSection: {
                title: '21 Jun, 2021 - 30days',
                caption: strings('drawdown.repayment_date'),
              },
            },
            {
              icon: 'divide',
              leftSection: {
                caption: strings('drawdown.repayment_amount', {
                  amount: amountWithCurrency(transactionFee),
                }),
                title: amountWithCurrency(totalRepaymentAmount),
              },
            },
          ]}
          doneButton={{
            title: strings('drawdown.request'),
            onPress: () => {
              closeModal();
            },
          }}
        />
      ),
      showHandleNub: false,
    });
  }, [closeModal, openModal]);

  const handleMakeRepayment = useCallback(() => {
    openModal('bottom-half', {
      renderContent: () => (
        <AmountForm
          header={{
            title: strings('drawdown.repayment'),
          }}
          leadText={`${strings(
            'payment_activities.wallet_balance',
          )}: ${amountWithCurrency(walletBalance)}`}
          onClose={closeModal}
          actionItems={[
            {
              icon: 'calendar',
              leftSection: {
                title: '21 Jun, 2021 - 30days',
                caption: strings('drawdown.repayment_date'),
              },
            },
            {
              icon: 'divide',
              leftSection: {
                caption: strings('drawdown.repayment_amount', {
                  amount: amountWithCurrency(transactionFee),
                }),
                title: amountWithCurrency(totalRepaymentAmount),
              },
            },
          ]}
          doneButton={{
            title: strings('drawdown.make_payment'),
            onPress: () => {
              closeModal();
            },
          }}
        />
      ),
      showHandleNub: false,
    });
  }, [closeModal, openModal]);

  const onDrawdownTabChange = useCallback(() => {}, []);
  const onHelp = useCallback(() => {}, []);
  const renderListItem = useCallback(() => null, []);
  const drawdownHistory: any[] = [];
  return (
    <Page
      header={{
        title: strings('drawdown.title'),
        iconLeft: {},
        headerRight: {
          options: [{icon: {name: 'help-circle'}, onPress: onHelp}],
        },
      }}
      style={as('px-0')}>
      <MoneyActionsContainer
        figure={{
          label: strings('drawdown.amount_available'),
          value: amountWithCurrency(availableDrawdownAmount),
        }}
        tag={{
          label: strings('drawdown.amount_owed', {
            total_owed: amountOwed,
          }),
          style: as('bg-red-10 text-red-100'),
        }}
        actions={[
          {
            icon: {
              name: 'arrow-down',
              color: colors['red-100'],
              bgColor: colors['red-10'],
            },
            onPress: handleTakeDrawdown,
            label: strings('drawdown.take_drawdown'),
          },
          {
            icon: {
              name: 'arrow-up',
              color: colors['blue-100'],
              bgColor: colors['blue-10'],
            },
            onPress: handleMakeRepayment,
            label: strings('drawdown.make_repayment'),
          },
        ]}
      />
      {!!drawdownHistory.length && (
        <TabBar
          options={[
            {
              label: strings('drawdown.drawdown_history'),
              value: 'drawdown_history',
            },
            {
              label: strings('drawdown.active_drawdowns'),
              value: 'active_drawdowns',
            },
          ]}
          onChangeOption={onDrawdownTabChange}
        />
      )}
      <FlatList
        data={drawdownHistory}
        initialNumToRender={10}
        style={applyStyles('bg-white')}
        renderItem={renderListItem}
        contentContainerStyle={as('flex-1')}
        ListEmptyComponent={
          <EmptyState style={as('mt-32')}>
            <View style={applyStyles('center px-8')}>
              <Text style={applyStyles('text-black text-sm text-center')}>
                {strings('drawdown.nothing_here')}
              </Text>
            </View>
          </EmptyState>
        }
      />
    </Page>
  );
});
