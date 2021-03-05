import {TabBar, Text} from '@/components';
import EmptyState from '@/components/EmptyState';
import {Page} from '@/components/Page';
import {withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {IDrawdown} from '@/models/Drawdown';
import {IDrawdownRepayment} from '@/models/DrawdownRepayment';
import {MoneyActionsContainer} from '@/screens/main/money/MoneyActionsContainer';
import {getI18nService} from '@/services';
import {useDrawdown} from '@/services/drawdown';
import {useDrawdownRepayment} from '@/services/drawdown-repayment';
import {useAppNavigation} from '@/services/navigation';
import {useWallet} from '@/services/wallet';
import {applyStyles, as, colors} from '@/styles';
import {format} from 'date-fns';
import {orderBy} from 'lodash';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, View} from 'react-native';
import {DrawdownActivityItem} from './DrawdownActivityItem';
import {DrawdownExplanationModal} from './DrawdownExplanationModal';
import {DrawdownRepaymentActivityItem} from './DrawdownRepaymentActivityItem';
import {MakeDrawdownRepaymentForm} from './MakeDrawdownRepaymentForm';
import {TakeDrawdownForm} from './TakeDrawdownForm';

const strings = getI18nService().strings;

function isDrawdown(item: IDrawdown | IDrawdownRepayment): item is IDrawdown {
  return (item as IDrawdown).transaction_fee_amount !== undefined;
}

export const DrawdownScreen = withModal(({openModal, closeModal}) => {
  const {getDrawdowns} = useDrawdown();
  const {getDrawdownRepayments} = useDrawdownRepayment();
  const {getWallet} = useWallet();
  const navigation = useAppNavigation();

  const drawdowns = getDrawdowns().sorted('created_at', true);
  const drawdownRepayments = getDrawdownRepayments().sorted('created_at', true);

  const [wallet, setWallet] = useState(getWallet());
  const [filterStatus, setFilterStatus] = useState('all');

  const amountOwed = wallet?.drawdown_amount_owed;
  const availableDrawdownAmount = wallet?.drawdown_amount_available;

  useEffect(() => {
    return navigation.addListener('focus', () => {
      setWallet(getWallet());
    });
  }, [navigation]);

  const handleTakeDrawdown = useCallback(() => {
    openModal('bottom-half', {
      renderContent: () => (
        <TakeDrawdownForm
          {...{
            wallet,
            openModal,
            closeModal,
          }}
        />
      ),
    });
  }, [closeModal, openModal]);

  const handleMakeRepayment = useCallback(() => {
    openModal('bottom-half', {
      renderContent: () => (
        <MakeDrawdownRepaymentForm
          wallet={wallet}
          openModal={openModal}
          closeModal={closeModal}
        />
      ),
    });
  }, [closeModal, openModal]);

  const onDrawdownTabChange = useCallback((tab) => {
    setFilterStatus(tab.value);
  }, []);

  const onHelp = useCallback(() => {
    openModal('bottom-half', {
      renderContent: () => (
        <DrawdownExplanationModal
          header={{
            title: strings('drawdown.what_is_drawdown'),
          }}
        />
      ),
    });
  }, []);

  const renderListItem = useCallback(
    ({item}: {item: IDrawdown | IDrawdownRepayment}) =>
      isDrawdown(item) ? (
        <DrawdownActivityItem data={item} />
      ) : (
        <DrawdownRepaymentActivityItem data={item} />
      ),
    [],
  );

  const filteredDrawdowns = useMemo(() => {
    let userDrawdowns = drawdowns;
    let userDrawdownRepayments = drawdownRepayments;
    switch (filterStatus) {
      case 'all':
        return orderBy(
          [...userDrawdowns, ...userDrawdownRepayments],
          'created_at',
          'desc',
        );
      case 'active':
        return userDrawdowns.filtered('status == "active"');
      default:
        return userDrawdowns;
    }
  }, [filterStatus, drawdowns]);

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
            total_owed: amountWithCurrency(amountOwed),
          }),
          style: as('bg-red-10 text-red-100'),
        }}
        caption={
          wallet?.drawdown_repayment_date
            ? {
                label: strings('drawdown.repayment_date.with_date', {
                  date: `${format(
                    wallet?.drawdown_repayment_date,
                    'dd MMMM, yyyy',
                  )}`,
                }),
                style: {
                  body: applyStyles('text-gray-100 text-400 text-base'),
                  strong: applyStyles('text-500 text-black'),
                },
              }
            : undefined
        }
        actions={[
          {
            icon: {
              name: 'arrow-down',
              color: colors['red-100'],
              bgColor: colors['red-10'],
            },
            onPress: handleTakeDrawdown,
            disabled: !wallet?.is_drawdown_active,
            label: strings('drawdown.take_drawdown'),
          },
          {
            icon: {
              name: 'arrow-up',
              color: colors['blue-100'],
              bgColor: colors['blue-10'],
            },
            onPress: handleMakeRepayment,
            disabled: !wallet?.is_drawdown_active,
            label: strings('drawdown.make_repayment'),
          },
        ]}
      />
      {!!filteredDrawdowns.length && (
        <View style={applyStyles('pb-16')}>
          <TabBar
            options={[
              {
                label: strings('drawdown.drawdown_history'),
                value: 'all',
              },
              {
                label: strings('drawdown.active_drawdowns'),
                value: 'active',
              },
            ]}
            onChangeOption={onDrawdownTabChange}
          />
        </View>
      )}
      {wallet?.is_drawdown_active ? (
        <FlatList
          data={filteredDrawdowns}
          initialNumToRender={10}
          style={applyStyles('bg-white')}
          renderItem={renderListItem}
          contentContainerStyle={as('flex-1')}
          keyExtractor={(item) => `${item?._id?.toString()}`}
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
      ) : (
        <View style={applyStyles('flex-1 py-64 flex-row center')}>
          <Text style={applyStyles('text-center', {width: 320})}>
            {strings('drawdown.not_qualified')}
          </Text>
        </View>
      )}
    </Page>
  );
});
