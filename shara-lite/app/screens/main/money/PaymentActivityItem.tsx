import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {ICollection} from '@/models/Collection';
import {IDisbursement} from '@/models/Disbursement';
import {useCollection} from '@/services/collection';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import {formatDistanceToNowStrict} from 'date-fns';
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

export const PaymentActivityItem = ({
  data,
}: {
  data: ICollection | IDisbursement;
}) => {
  const {amount, created_at, provider} = data;
  const [customer, setCustomer] = useState<ICustomer | undefined>(
    isCollection(data) ? data.customer : undefined,
  );

  const navigation = useAppNavigation();
  const {updateCollection} = useCollection();

  const handleUpdateCollectionCustomer = useCallback(
    (customer: ICustomer) => {
      if (isCollection(data)) {
        setCustomer(customer);
        updateCollection({collection: data, updates: {customer}});
        navigation.goBack();
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
          <Text style={applyStyles('text-gray-300 pb-2')}>
            Received payment of {amountWithCurrency(amount)} via {provider}
          </Text>
          <View>
            {customer ? (
              <Text style={applyStyles('text-700 text-gray-100')}>
                {customer.name}
              </Text>
            ) : (
              <Text style={applyStyles('flex-1 text-secondary text-700')}>
                Select customer
              </Text>
            )}
          </View>
        </View>
      );
    }
    return (
      <View>
        <Text>
          Withdrawal of {amountWithCurrency(amount)} to your {provider}
        </Text>
      </View>
    );
  }, [data]);

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
