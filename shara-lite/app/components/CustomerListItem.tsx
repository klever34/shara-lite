import Icon from '@/components/Icon';
import PlaceholderImage from '@/components/PlaceholderImage';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {applyStyles, colors} from '@/styles';
import {formatDistanceToNowStrict, isBefore, isToday} from 'date-fns';
import React, {ReactNode, useCallback} from 'react';
import {Text} from '@/components';
import {View, ViewStyle} from 'react-native';

type CustomerListItemProps = {
  customer: ICustomer;
  containerStyle?: ViewStyle;
  onPress?: () => void;
  getDateText?: () => ReactNode;
};

export const CustomerListItem = ({
  customer,
  containerStyle,
  onPress,
  getDateText,
}: CustomerListItemProps) => {
  getDateText =
    getDateText ??
    useCallback(() => {
      if (customer.balance && customer.balance < 0) {
        if (customer.due_date) {
          if (isToday(customer.due_date)) {
            return (
              <Text style={applyStyles('text-xs text-700 text-red-100')}>
                Due today
              </Text>
            );
          }
          if (isBefore(customer.due_date, new Date())) {
            return (
              <Text style={applyStyles('text-xs text-700 text-red-100')}>
                Due{' '}
                {formatDistanceToNowStrict(customer.due_date, {
                  addSuffix: true,
                })}
              </Text>
            );
          }
          return (
            <Text style={applyStyles('text-xs text-700 text-red-100')}>
              Collect{' '}
              {formatDistanceToNowStrict(customer.due_date, {
                addSuffix: true,
              })}
            </Text>
          );
        }
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
          {
            borderBottomWidth: 1.2,
            borderBottomColor: colors['gray-20'],
          },
          containerStyle,
        )}>
        <PlaceholderImage
          text={customer?.name ?? ''}
          image={customer.image ? {uri: customer?.image} : undefined}
        />
        <View style={applyStyles('flex-1 pl-sm')}>
          <Text style={applyStyles('pb-4 text-base text-400 text-gray-300')}>
            {customer.name}
          </Text>
          {getDateText()}
        </View>
        {!!customer.balance && (
          <View style={applyStyles('items-end flex-row')}>
            <Text style={applyStyles('text-base text-700 text-black')}>
              {customer.balance && customer.balance < 0 ? '-' : ''}
              {amountWithCurrency(customer?.balance)}
            </Text>
            {!!customer?.balance && customer?.balance < 0 && (
              <View style={applyStyles('pl-4')}>
                <Icon
                  size={18}
                  name="arrow-up"
                  type="feathericons"
                  color={colors['red-100']}
                />
              </View>
            )}
            {!!customer?.balance && customer?.balance > 0 && (
              <View style={applyStyles('pl-4')}>
                <Icon
                  size={18}
                  name="arrow-down"
                  type="feathericons"
                  color={colors['green-200']}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </Touchable>
  );
};
