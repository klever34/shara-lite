import {Icon} from '@/components/Icon';
import PlaceholderImage from '@/components/PlaceholderImage';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {useReceipt} from '@/services/receipt';
import {applyStyles, colors} from '@/styles';
import {format, formatDistanceToNowStrict} from 'date-fns';
import React, {useCallback, useMemo} from 'react';
import {Text, View, ViewStyle} from 'react-native';

export type ReceiptListItemProps = {
  style?: ViewStyle;
  isHeader?: boolean;
  receipt?: IReceipt;
  onPress?: () => void;
  getReceiptItemLeftText?: (receipt?: IReceipt) => string;
  getReceiptItemRightText?: (receipt?: IReceipt) => string;
};

export const TransactionListItem = ({
  style,
  receipt,
  onPress,
  getReceiptItemLeftText,
  getReceiptItemRightText,
}: ReceiptListItemProps) => {
  const {getReceiptAmounts} = useReceipt();
  const {creditAmountLeft} = getReceiptAmounts(receipt);

  const getStatusText = useCallback(() => {
    if (receipt?.isPaid) {
      return '';
    }
    if (receipt?.dueDate) {
      if (receipt.dueDate.getTime() < Date.now()) {
        return `due ${formatDistanceToNowStrict(receipt.dueDate)}`;
      } else {
        return `collect on ${format(receipt?.dueDate, 'dd MMM, yyy')}`;
      }
    } else {
      return 'set collection date';
    }
  }, [receipt]);

  const getStatusTextColor = useCallback(() => {
    if (receipt?.dueDate) {
      if (receipt.dueDate.getTime() < Date.now()) {
        return 'text-red-200';
      }
      return 'text-gray-200';
    } else {
      return 'text-gray-50';
    }
  }, [receipt]);

  getReceiptItemLeftText = useMemo(() => {
    if (!getReceiptItemLeftText) {
      return (currentReceipt) => {
        return currentReceipt?.customer?.name ?? 'No customer';
      };
    }
    return getReceiptItemLeftText;
  }, [getReceiptItemLeftText]);

  getReceiptItemRightText = useMemo(() => {
    if (!getReceiptItemRightText) {
      return (currentReceipt) => {
        return currentReceipt?.created_at
          ? formatDistanceToNowStrict(currentReceipt?.created_at, {
              addSuffix: true,
            })
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
        <View style={applyStyles('flex-row items-center', {width: '48%'})}>
          {receipt?.isPaid ? (
            <View style={applyStyles('flex-row items-center')}>
              <View
                style={applyStyles('center bg-green-200', {
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                })}>
                <Icon
                  size={16}
                  name="dollar-sign"
                  type="feathericons"
                  color={colors.white}
                />
              </View>
              <View style={applyStyles('pl-8')}>
                <Text
                  style={applyStyles(
                    'pb-4 text-gray-50 text-700 text-sm text-uppercase',
                  )}>
                  Payment received
                </Text>
                <Text
                  style={applyStyles(
                    'text-uppercase text-400 text-gray-200 text-xxs',
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
                    'text-uppercase text-400 text-gray-200 text-xxs',
                  )}>
                  {getReceiptItemRightText(receipt)}
                </Text>
              </View>
            </>
          )}
        </View>
        <View style={applyStyles('items-end', {width: '48%'})}>
          <Text
            style={applyStyles(
              `pb-4 text-700 ${
                receipt?.isPaid ? 'text-gray-300' : 'text-red-200'
              }`,
            )}>
            {amountWithCurrency(
              receipt?.isPaid ? receipt?.total_amount : creditAmountLeft,
            )}
          </Text>
          <Text
            style={applyStyles(
              `text-700 text-uppercase text-xxs ${getStatusTextColor()}`,
            )}>
            {getStatusText()}
          </Text>
        </View>
      </View>
    </Touchable>
  );
};
