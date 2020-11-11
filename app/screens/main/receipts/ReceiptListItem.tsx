import {Icon} from '@/components/Icon';
import PlaceholderImage from '@/components/PlaceholderImage';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {useReceipt} from '@/services/receipt';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React, {useMemo} from 'react';
import {Text, View, ViewStyle} from 'react-native';

export type ReceiptListItemProps = {
  style?: ViewStyle;
  isHeader?: boolean;
  receipt?: IReceipt;
  onPress?: () => void;
  getReceiptItemLeftText?: (receipt?: IReceipt) => string;
  getReceiptItemRightText?: (receipt?: IReceipt) => string;
};

export const ReceiptListItem = ({
  style,
  receipt,
  onPress,
  isHeader = false,
  getReceiptItemLeftText,
  getReceiptItemRightText,
}: ReceiptListItemProps) => {
  const {getReceiptAmounts} = useReceipt();
  const {creditAmountLeft} = getReceiptAmounts(receipt);
  const hasCustomer = receipt?.hasCustomer;
  const statusText = receipt?.is_cancelled
    ? 'Cancelled'
    : !creditAmountLeft
    ? 'Paid'
    : isHeader
    ? 'owes you'
    : `owes ${amountWithCurrency(creditAmountLeft)}`;
  const statusTextWeight =
    !creditAmountLeft || receipt?.is_cancelled ? 'text-400' : 'text-700';
  const statusTextColor =
    !creditAmountLeft || receipt?.is_cancelled
      ? 'text-gray-200'
      : 'text-red-100';

  getReceiptItemLeftText = useMemo(() => {
    if (!getReceiptItemLeftText) {
      return (currentReceipt) => {
        return currentReceipt?.customer?.name ?? 'No Customer';
      };
    }
    return getReceiptItemLeftText;
  }, [getReceiptItemLeftText]);

  getReceiptItemRightText = useMemo(() => {
    if (!getReceiptItemRightText) {
      return (currentReceipt) => {
        return currentReceipt?.created_at
          ? format(currentReceipt?.created_at, 'MMM dd yyyy, hh:mmaa')
          : '';
      };
    }
    return getReceiptItemRightText;
  }, [getReceiptItemRightText]);

  return (
    <Touchable onPress={onPress ? onPress : undefined}>
      <View
        style={applyStyles(
          'px-16 py-16 flex-row items-center justify-between',
          {
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-10'],
          },
          style,
        )}>
        <View style={applyStyles('flex-row items-center')}>
          {!hasCustomer && isHeader ? (
            <View style={applyStyles('flex-row items-center')}>
              <View
                style={applyStyles('center bg-gray-20', {
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                })}>
                <Icon
                  size={16}
                  name="plus"
                  type="feathericons"
                  color={colors['gray-50']}
                />
              </View>
              <View style={applyStyles('pl-8')}>
                <Text
                  style={applyStyles(
                    'pb-4 text-700 text-sm text-primary text-uppercase',
                    {
                      textDecorationLine: 'underline',
                    },
                  )}>
                  Add Customer details
                </Text>
                <Text
                  style={applyStyles(
                    'text-uppercase text-400 text-gray-200 text-xs',
                  )}>
                  {getReceiptItemRightText(receipt)}
                </Text>
              </View>
            </View>
          ) : (
            <>
              <PlaceholderImage text={receipt?.customer?.name ?? ''} />
              <View style={applyStyles('pl-sm')}>
                <Text
                  numberOfLines={1}
                  style={applyStyles(
                    'pb-4 text-uppercase text-700 text-gray-300',
                  )}>
                  {getReceiptItemLeftText(receipt)}
                </Text>
                <Text
                  style={applyStyles(
                    'text-uppercase text-400 text-gray-200 text-xs',
                  )}>
                  {getReceiptItemRightText(receipt)}
                </Text>
              </View>
            </>
          )}
        </View>
        <View style={applyStyles('items-end')}>
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
