import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IBNPLDrawdown} from '@/models/BNPLDrawdown';
import {IBNPLRepayment} from '@/models/BNPLRepayment';
import {ICollection} from '@/models/Collection';
import {IDisbursement} from '@/models/Disbursement';
import {getAnalyticsService, getI18nService} from '@/services';
import {useCollection} from '@/services/collection';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import {format, formatDistanceToNowStrict} from 'date-fns';
import React, {useCallback, useState} from 'react';
import {InteractionManager, Text, View} from 'react-native';
import Markdown from 'react-native-markdown-display';

export type PaymentActivityItemData =
  | ICollection
  | IDisbursement
  | IBNPLDrawdown
  | IBNPLRepayment;

const markdownStyle = {
  body: applyStyles('text-gray-300 text-400 text-base'),
  em: applyStyles('text-500', {
    fontWeight: '500',
    fontStyle: 'normal',
  }),
};

const strings = getI18nService().strings;

const statusColors = {
  success: 'text-green-200',
  pending: 'text-yellow-100',
  failed: 'text-red-100',
} as {[key: string]: string};

export const PaymentActivityItem = ({
  data,
}: {
  data: PaymentActivityItemData;
}) => {
  const renderItem = useCallback(() => {
    if ('interest_rate' in data) {
      return <BNPLDrawdownItem data={data} />;
    }
    if ('principal_amount' in data) {
      return <BNPLRepaymentItem data={data} />;
    }
    if ('collection_method_id' in data) {
      return <CollectionItem data={data} />;
    }
    if ('disbursement_method_id' in data) {
      return <DisbursementItem data={data} />;
    }
  }, [data]);

  return <>{renderItem()}</>;
};

const BNPLDrawdownItem = ({data}: {data: IBNPLDrawdown}) => {
  const {amount_drawn, amount_owed, takes_charge, created_at, customer} = data;
  const amount = takes_charge === "client" ? amount_drawn : amount_owed;
  
  return (
    <View
      style={applyStyles('px-16 py-8 flex-row items-center justify-between', {
        borderBottomWidth: 1.2,
        borderBottomColor: colors['gray-20'],
      })}>
      <View style={applyStyles('flex-row items-center', {width: '66%'})}>
        <Icon
          size={18}
          name="arrow-down"
          type="feathericons"
          color={colors['green-200']}
        />
        <View style={applyStyles('pl-8')}>
          <Markdown style={markdownStyle}>
            {strings('payment_activities.bnpl_drawdown_item', {
              amount: amountWithCurrency(amount),
              customer: customer?.name,
            })}
          </Markdown>
        </View>
      </View>
      <View style={applyStyles('items-end', {width: '30%'})}>
        <View
          style={applyStyles('mb-2 py-4 px-8 bg-gray-10 rounded-16 center', {
            borderWidth: 1,
            borderColor: colors['gray-20'],
          })}>
          <Text style={applyStyles('pb-4 text-700 text-xs text-green-200')}>
            {amountWithCurrency(amount)}
          </Text>
        </View>
        <Text
          style={applyStyles('text-400 text-uppercase text-xxs text-gray-100')}>
          {created_at &&
            formatDistanceToNowStrict(created_at, {
              addSuffix: true,
            })}
        </Text>
      </View>
    </View>
  );
};

const BNPLRepaymentItem = ({data}: {data: IBNPLRepayment}) => {
  const {repayment_amount, amount_repaid, bnpl_drawdown, completed_at} = data;

  return (
    <View
      style={applyStyles('px-16 py-8 flex-row items-center justify-between', {
        borderBottomWidth: 1.2,
        borderBottomColor: colors['gray-20'],
      })}>
      <View style={applyStyles('flex-row items-center', {width: '66%'})}>
        <Icon
          size={18}
          name="arrow-down"
          type="feathericons"
          color={colors['green-200']}
        />
        <View style={applyStyles('pl-8')}>
          <Markdown style={markdownStyle}>
            {strings('payment_activities.bnpl_repayment_item', {
              amount: amountWithCurrency(amount_repaid || repayment_amount),
              customer: bnpl_drawdown?.customer?.name,
            })}
          </Markdown>
        </View>
      </View>
      <View style={applyStyles('items-end', {width: '30%'})}>
        <View
          style={applyStyles('mb-2 py-4 px-8 bg-gray-10 rounded-16 center', {
            borderWidth: 1,
            borderColor: colors['gray-20'],
          })}>
          <Text style={applyStyles('pb-4 text-700 text-xs text-green-200')}>
            {amountWithCurrency(amount_repaid || repayment_amount)}
          </Text>
        </View>
        <Text
          style={applyStyles('text-400 text-uppercase text-xxs text-gray-100')}>
          {completed_at && format(completed_at, 'dd MMMM yyyy')}
        </Text>
      </View>
    </View>
  );
};

const CollectionItem = ({data}: {data: ICollection}) => {
  const {amount, created_at, type, provider_label, status} = data;
  const [customer, setCustomer] = useState<ICustomer | undefined>(
    data.customer,
  );

  const navigation = useAppNavigation();
  const {updateCollection} = useCollection();

  const handleUpdateCollectionCustomer = useCallback(
    (customer: ICustomer) => {
      setCustomer(customer);
      updateCollection({collection: data, updates: {customer}});
      navigation.navigate('PaymentActivities');
      getAnalyticsService()
        .logEvent('updateCollectionWithCustomer', {})
        .then(() => {});
    },
    [updateCollection, navigation, data],
  );

  const handleOpenSelectCustomer = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate('SelectCustomerList', {
        onSelectCustomer: handleUpdateCollectionCustomer,
      });
    });
  }, [navigation, data]);

  return (
    <Touchable onPress={!customer ? handleOpenSelectCustomer : undefined}>
      <View
        style={applyStyles('px-16 py-8 flex-row items-center justify-between', {
          borderBottomWidth: 1.2,
          borderBottomColor: colors['gray-20'],
        })}>
        <View style={applyStyles('flex-row items-center', {width: '66%'})}>
          <Icon
            size={18}
            name="arrow-down"
            type="feathericons"
            color={colors['green-200']}
          />
          <View style={applyStyles('pl-8')}>
            <View>
              <Markdown style={markdownStyle}>
                {strings(
                  'payment_activities.payment_activity.received_payment',
                  {
                    amount: amountWithCurrency(amount),
                    provider: provider_label || type,
                  },
                )}
              </Markdown>
              <View style={applyStyles('flex-row items-center')}>
                <>
                  {customer ? (
                    <Text style={applyStyles('text-700 text-gray-100')}>
                      {customer.name}
                    </Text>
                  ) : (
                    <Text style={applyStyles('text-secondary text-700')}>
                      {strings(
                        'payment_activities.payment_activity.select_customer',
                      )}
                    </Text>
                  )}
                </>

                <Text
                  style={applyStyles(
                    `pl-8 text-700 text-capitalize ${statusColors[status]}`,
                  )}>
                  {status}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={applyStyles('items-end', {width: '30%'})}>
          <View
            style={applyStyles('mb-2 py-4 px-8 bg-gray-10 rounded-16 center', {
              borderWidth: 1,
              borderColor: colors['gray-20'],
            })}>
            <Text style={applyStyles('pb-4 text-700 text-xs text-green-200')}>
              {amountWithCurrency(amount)}
            </Text>
          </View>
          <Text
            style={applyStyles(
              'text-400 text-uppercase text-xxs text-gray-100',
            )}>
            {created_at &&
              formatDistanceToNowStrict(created_at, {
                addSuffix: true,
              })}
          </Text>
        </View>
      </View>
    </Touchable>
  );
};

const DisbursementItem = ({data}: {data: IDisbursement}) => {
  const {amount, created_at, type, provider_label, status} = data;

  return (
    <View
      style={applyStyles('px-16 py-8 flex-row items-center justify-between', {
        borderBottomWidth: 1.2,
        borderBottomColor: colors['gray-20'],
      })}>
      <View style={applyStyles('flex-row items-center', {width: '66%'})}>
        <Icon
          size={18}
          name="arrow-up"
          type="feathericons"
          color={colors['red-100']}
        />
        <View style={applyStyles('pl-8')}>
          <View>
            <Markdown style={markdownStyle}>
              {strings('payment_activities.payment_activity.withdrawal', {
                amount: amountWithCurrency(amount),
                provider: provider_label || type,
              })}
            </Markdown>
          </View>

          <Text
            style={applyStyles(
              `text-700 text-capitalize ${statusColors[status]}`,
            )}>
            {status}
          </Text>
        </View>
      </View>
      <View style={applyStyles('items-end', {width: '30%'})}>
        <View
          style={applyStyles('mb-2 py-4 px-8 bg-gray-10 rounded-16 center', {
            borderWidth: 1,
            borderColor: colors['gray-20'],
          })}>
          <Text style={applyStyles('pb-4 text-700 text-xs text-red-200')}>
            {amountWithCurrency(amount)}
          </Text>
        </View>
        <Text
          style={applyStyles('text-400 text-uppercase text-xxs text-gray-100')}>
          {created_at &&
            formatDistanceToNowStrict(created_at, {
              addSuffix: true,
            })}
        </Text>
      </View>
    </View>
  );
};
