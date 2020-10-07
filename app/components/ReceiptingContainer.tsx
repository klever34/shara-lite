import React, {ReactNode, useCallback} from 'react';
import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {colors} from '@/styles';
import {SafeAreaView, Text, TextStyle, View} from 'react-native';
import {Button} from '@/components/Button';
import {Icon} from '@/components/Icon';
import {IReceipt} from '@/models/Receipt';
import EmptyState from '@/components/EmptyState';
import {FlatList} from 'react-native-gesture-handler';
import Touchable from '@/components/Touchable';

type ReceiptingContainerProps = {
  handleListItemSelect?: (receiptId: IReceipt['_id']) => void;
  emptyStateText: string;
  getReceiptItemLeftText: (
    receipt: IReceipt,
    baseStyle: TextStyle,
  ) => {style: TextStyle; children: ReactNode};
  receipts?: IReceipt[];
  children: ReactNode;
  onSnapReceipt?(): void;
  onCreateReceipt?(): void;
};

export const ReceiptingContainer = ({
  receipts,
  children,
  onSnapReceipt,
  emptyStateText,
  onCreateReceipt,
  handleListItemSelect,
  getReceiptItemLeftText,
}: ReceiptingContainerProps) => {
  const renderReceiptItem = useCallback(
    ({item}: {item: IReceipt}) => {
      return (
        <ReceiptListItem
          receipt={item}
          handleListItemSelect={handleListItemSelect}
          getReceiptItemLeftText={getReceiptItemLeftText}
        />
      );
    },
    [getReceiptItemLeftText, handleListItemSelect],
  );
  return (
    <SafeAreaView
      style={applyStyles('flex-1', {backgroundColor: colors.white})}>
      <View style={applyStyles('flex-1')}>
        {children}
        <FlatList
          data={receipts}
          initialNumToRender={10}
          renderItem={renderReceiptItem}
          keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
          ListEmptyComponent={
            <EmptyState
              heading="No Sales"
              text={emptyStateText}
              style={applyStyles({paddingTop: 100})}
            />
          }
        />
      </View>
      <View
        style={applyStyles('flex-row center justify-between px-md py-lg', {
          elevation: 100,
          borderTopWidth: 1,
          backgroundColor: colors.white,
          borderTopColor: colors['gray-20'],
        })}>
        <View style={applyStyles({width: '48%'})}>
          <Button onPress={onCreateReceipt}>
            <View style={applyStyles('flex-row center')}>
              <Icon
                size={24}
                name="plus"
                type="feathericons"
                color={colors.white}
              />
              <Text
                style={applyStyles(
                  'text-400 text-uppercase pl-sm text-xs text-white',
                )}>
                Create receipt
              </Text>
            </View>
          </Button>
        </View>
        <View style={applyStyles({width: '48%'})}>
          <Button onPress={onSnapReceipt} variantColor="clear">
            <View style={applyStyles('flex-row center')}>
              <Icon
                size={24}
                name="camera"
                type="feathericons"
                color={colors['gray-300']}
              />
              <Text
                style={applyStyles(
                  'text-400 text-uppercase pl-sm text-xs text-gray-300',
                )}>
                snap receipt
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

type ReceiptListItemProps = {
  receipt: IReceipt;
  handleListItemSelect?: (receiptId: IReceipt['_id']) => void;
  getReceiptItemLeftText: (
    receipt: IReceipt,
    baseStyle: TextStyle,
  ) => {style: TextStyle; children: ReactNode};
};

export const ReceiptListItem = ({
  receipt,
  handleListItemSelect,
  getReceiptItemLeftText,
}: ReceiptListItemProps) => {
  let amountTextStyle = applyStyles('text-700', {
    fontSize: 16,
    color: colors['gray-300'],
  });

  if (!receipt.isPaid) {
    amountTextStyle = {...amountTextStyle, color: colors['red-200']};
  }

  if (receipt.is_cancelled) {
    amountTextStyle = {
      ...amountTextStyle,
      ...applyStyles('text-400'),
      fontStyle: 'italic',
      color: colors['gray-100'],
      textDecorationLine: 'line-through',
    };
  }

  if (receipt.isPending) {
    amountTextStyle = {
      ...amountTextStyle,
      ...applyStyles('text-400'),
      fontStyle: 'italic',
      color: colors['gray-100'],
    };
  }
  return (
    <Touchable
      onPress={
        handleListItemSelect
          ? () => handleListItemSelect(receipt._id)
          : undefined
      }>
      <View
        style={applyStyles('px-md flex-row center justify-between', {
          height: 50,
          borderBottomWidth: 1,
          borderBottomColor: colors['gray-20'],
        })}>
        <View>
          <Text
            {...getReceiptItemLeftText(
              receipt,
              applyStyles('text-400', {
                fontSize: 16,
                color: colors['gray-300'],
              }),
            )}
          />
        </View>
        <View>
          <Text style={amountTextStyle}>
            {amountWithCurrency(receipt.total_amount)}
          </Text>
        </View>
      </View>
    </Touchable>
  );
};
