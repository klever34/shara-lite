import React, {useCallback} from 'react';
import {Text, View, ViewStyle} from 'react-native';
import {applyStyles, colors} from '@/styles';
import PlaceholderImage from '@/components/PlaceholderImage';
import {amountWithCurrency} from '@/helpers/utils';
import Icon from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {ICustomer} from '@/models';
import {formatDistanceToNowStrict} from 'date-fns';

type CustomerListItemProps = {
  customer: ICustomer;
  containerStyle?: ViewStyle;
  onPress?: () => void;
};

export const CustomerListItem = ({
  customer,
  containerStyle,
  onPress,
}: CustomerListItemProps) => {
  const getDateText = useCallback(() => {
    if (customer.dueDate) {
      if (customer.overdueCreditAmount) {
        return (
          <Text style={applyStyles('text-xs text-700 text-red-100')}>
            Due{' '}
            {formatDistanceToNowStrict(customer.dueDate, {
              addSuffix: true,
            })}
          </Text>
        );
      }
      if (customer.remainingCreditAmount && !customer.overdueCreditAmount) {
        return (
          <Text style={applyStyles('text-xs text-700 text-red-100')}>
            Collect in{' '}
            {formatDistanceToNowStrict(customer.dueDate, {
              addSuffix: true,
            })}
          </Text>
        );
      }
    }
    if (!customer.dueDate && customer.remainingCreditAmount) {
      return (
        <Text style={applyStyles('text-xs text-700 text-gray-100')}>
          No Collection Date
        </Text>
      );
    }
    return (
      <Text style={applyStyles('text-xs text-700 text-gray-100')}>
        {customer?.created_at &&
          formatDistanceToNowStrict(customer?.created_at, {
            addSuffix: true,
          })}
      </Text>
    );
  }, [customer]);
  return (
    <Touchable onPress={onPress}>
      <View
        style={applyStyles(
          'flex-row items-center border-b-1 border-gray-20',
          containerStyle,
        )}>
        <PlaceholderImage text={customer?.name ?? ''} />
        <View style={applyStyles('flex-1 pl-sm')}>
          <Text style={applyStyles('pb-4 text-base text-400 text-gray-300')}>
            {customer.name}
          </Text>
          {getDateText()}
        </View>
        <View style={applyStyles('items-end flex-row')}>
          <Text style={applyStyles('text-base text-700 text-black')}>
            {amountWithCurrency(customer.remainingCreditAmount ?? 0)}
          </Text>
          {!!customer.remainingCreditAmount && (
            <View style={applyStyles('pl-4')}>
              <Icon
                size={18}
                name="arrow-up"
                type="feathericons"
                color={colors['red-100']}
              />
            </View>
          )}
        </View>
      </View>
    </Touchable>
  );
};
