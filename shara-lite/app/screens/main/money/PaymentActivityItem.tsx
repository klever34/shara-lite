import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {ICollection} from '@/models/Collection';
import {IDisbursement} from '@/models/Disbursement';
import {applyStyles, colors} from '@/styles';
import {formatDistanceToNowStrict} from 'date-fns';
import React, {useCallback} from 'react';
import {Text, View} from 'react-native';
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

  const renderItemText = useCallback(() => {
    if (isCollection(data)) {
      return (
        <View>
          <Markdown style={markdownStyle}>
            Received payment of {amountWithCurrency(amount)} via {provider}
          </Markdown>
          {data.customer ? (
            <Text>{data.customer.name}</Text>
          ) : (
            <Touchable>
              <Text>Select customer</Text>
            </Touchable>
          )}
        </View>
      );
    }
    return (
      <View>
        <Markdown style={markdownStyle}>
          Withdrawal of {amountWithCurrency(amount)} to your {provider}
        </Markdown>
      </View>
    );
  }, [data]);

  return (
    <View
      style={applyStyles('px-16 py-8 flex-row items-center justify-between', {
        borderBottomWidth: 1.2,
        borderBottomColor: colors['gray-20'],
      })}>
      <View style={applyStyles('flex-row items-center', {width: '66%'})}>
        <View style={applyStyles('pl-4')}>
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
