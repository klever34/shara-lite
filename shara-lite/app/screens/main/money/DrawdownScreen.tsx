import React, {useCallback} from 'react';
import {Page} from '@/components/Page';
import {FlatList, View} from 'react-native';
import {amountWithCurrency} from '@/helpers/utils';
import {applyStyles, as, colors} from '@/styles';
import {MoneyActionsContainer} from '@/screens/main/money/MoneyActionsContainer';
import {getI18nService} from '@/services';
import {Text, TabBar} from '@/components';
import EmptyState from '@/components/EmptyState';

const strings = getI18nService().strings;

export const DrawdownScreen = () => {
  const availableDrawdownAmount = 0;
  const amountOwed = 0;
  const handleTakeDrawdown = useCallback(() => {}, []);
  const handleMakeRepayment = useCallback(() => {}, []);
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
};
