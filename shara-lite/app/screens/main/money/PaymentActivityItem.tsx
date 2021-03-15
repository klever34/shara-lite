import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {ICollection} from '@/models/Collection';
import {IDisbursement} from '@/models/Disbursement';
import {getAnalyticsService, getI18nService} from '@/services';
import {useCollection} from '@/services/collection';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import {formatDistanceToNowStrict} from 'date-fns';
import {omit} from 'lodash';
import React, {useCallback, useState} from 'react';
import {InteractionManager, Text, View} from 'react-native';
import Markdown from 'react-native-markdown-display';

function isCollection(item: ICollection | IDisbursement): item is ICollection {
  return (item as ICollection).collection_method !== undefined;
}

const markdownStyle = {
  body: applyStyles('text-gray-300 text-400 text-base'),
  em: applyStyles('text-500', {
    fontWeight: '500',
    fontStyle: 'normal',
  }),
};

const strings = getI18nService().strings;

export const PaymentActivityItem = ({
  data,
}: {
  data: ICollection | IDisbursement;
}) => {
  const {amount, created_at, type, provider_label, status} = data;
  const [customer, setCustomer] = useState<ICustomer | undefined>(
    isCollection(data) ? data.customer : undefined,
  );

  const statusColors = {
    success: 'text-green-200',
    pending: 'text-yellow-100',
    failed: 'text-red-100',
  } as {[key: string]: string};

  const navigation = useAppNavigation();
  const {updateCollection} = useCollection();

  const handleUpdateCollectionCustomer = useCallback(
    (customer: ICustomer) => {
      if (isCollection(data)) {
        setCustomer(customer);
        updateCollection({collection: data, updates: {customer}});
        navigation.navigate('PaymentActivities');
        getAnalyticsService()
          .logEvent('updateCollectionWithCustomer', {})
          .then(() => {});
      }
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

  const renderItemText = useCallback(() => {
    if (isCollection(data)) {
      return (
        <View>
          <Markdown style={markdownStyle}>
            {strings('payment_activities.payment_activity.received_payment', {
              amount: amountWithCurrency(amount),
              provider: provider_label || type,
            })}
          </Markdown>
          <View>
            {customer ? (
              <Text style={applyStyles('text-700 text-gray-100')}>
                {customer.name}
              </Text>
            ) : (
              <Text style={applyStyles('flex-1 text-secondary text-700')}>
                {strings('payment_activities.payment_activity.select_customer')}
              </Text>
            )}
          </View>
        </View>
      );
    }
    return (
      <View>
        <Markdown style={markdownStyle}>
          {strings('payment_activities.payment_activity.withdrawal', {
            amount: amountWithCurrency(amount),
            provider: provider_label || type,
          })}
        </Markdown>
      </View>
    );
  }, [data, customer, amount, type, provider_label]);

  return (
    <Touchable
      onPress={
        isCollection(data) && !customer ? handleOpenSelectCustomer : undefined
      }>
      <View
        style={applyStyles('px-16 py-8 flex-row items-center justify-between', {
          borderBottomWidth: 1.2,
          borderBottomColor: colors['gray-20'],
        })}>
        <View style={applyStyles('flex-row items-center', {width: '66%'})}>
          <Icon
            size={18}
            type="feathericons"
            color={isCollection(data) ? colors['green-200'] : colors['red-100']}
            name={isCollection(data) ? 'arrow-down' : 'arrow-up'}
          />
          <View style={applyStyles('pl-8')}>
            <View>{renderItemText()}</View>

            {!isCollection(data) && (
              <Text
                style={applyStyles(
                  `text-700 text-capitalize ${statusColors[status]}`,
                )}>
                {status}
              </Text>
            )}
          </View>
        </View>
        <View style={applyStyles('items-end', {width: '30%'})}>
          <View
            style={applyStyles('mb-2 py-4 px-8 bg-gray-10 rounded-16 center', {
              borderWidth: 1,
              borderColor: colors['gray-20'],
            })}>
            <Text
              style={applyStyles(
                `pb-4 text-700 text-xs ${
                  isCollection(data) ? 'text-green-200' : 'text-red-200'
                }`,
              )}>
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
