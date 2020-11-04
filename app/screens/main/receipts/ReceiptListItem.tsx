import {Icon} from '@/components/Icon';
import PlaceholderImage from '@/components/PlaceholderImage';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {applyStyles, colors} from '@/styles';
import React from 'react';
import {Text, View} from 'react-native';

export const ReceiptListItem = ({
  receipt,
  onPress,
  leftSection,
  isHeader = false,
}: {
  isHeader?: boolean;
  receipt?: IReceipt;
  onPress?: () => void;
  leftSection?: {heading?: string; subheading?: string};
}) => {
  const hasCustomer = receipt?.hasCustomer;
  const statusText = receipt?.is_cancelled
    ? 'Cancelled'
    : receipt?.isPaid
    ? 'Paid'
    : 'owes you';
  const statusTextWeight =
    receipt?.isPaid || receipt?.is_cancelled ? 'text-400' : 'text-700';
  const statusTextColor =
    receipt?.isPaid || receipt?.is_cancelled ? 'text-gray-200' : 'text-red-100';

  return (
    <Touchable onPress={onPress ? onPress : undefined}>
      <View
        style={applyStyles(
          'px-16 pt-16 flex-row items-center justify-between',
          {
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-10'],
          },
        )}>
        <View style={applyStyles('pb-16 flex-row items-center')}>
          {!hasCustomer && isHeader ? (
            <>
              <View style={applyStyles('flex-row items-center')}>
                <Icon
                  size={20}
                  name="plus"
                  type="feathericons"
                  color={colors.primary}
                />
                <Text
                  style={applyStyles('pl-4 text-700 text-sm', {
                    color: colors.primary,
                  })}>
                  Add Customer
                </Text>
              </View>
            </>
          ) : (
            <>
              <PlaceholderImage text={receipt?.customer?.name ?? ''} />
              <View style={applyStyles('pl-sm')}>
                <Text
                  numberOfLines={1}
                  style={applyStyles(
                    'pb-4 text-uppercase text-700 text-gray-300',
                  )}>
                  {leftSection?.heading}
                </Text>
                <Text
                  style={applyStyles(
                    'text-uppercase text-400 text-gray-200 text-xs',
                  )}>
                  {leftSection?.subheading}
                </Text>
              </View>
            </>
          )}
        </View>
        <View style={applyStyles('pb-16 items-end')}>
          <Text style={applyStyles('pb-4 text-700 text-gray-300')}>
            {amountWithCurrency(receipt?.total_amount)}
          </Text>
          <Text
            style={applyStyles(
              `${statusTextWeight} text-uppercase text-xs ${statusTextColor}`,
            )}>
            {statusText}
          </Text>
        </View>
      </View>
    </Touchable>
  );
};
