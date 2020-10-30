import EmptyState from '@/components/EmptyState';
import Touchable from '@/components/Touchable';
import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {getAllPayments} from '@/services/ReceiptService';
import {colors} from '@/styles';
import React, {ReactNode, useCallback} from 'react';
import {SafeAreaView, Text, TextStyle, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {HomeContainer} from './HomeContainer';

type ReceiptingContainerProps = {
  handleListItemSelect?: (receiptId: IReceipt['_id']) => void;
  emptyStateText: string;
  getReceiptItemLeftText: (
    receipt: IReceipt,
    baseStyle: TextStyle,
  ) => {style: TextStyle; children: ReactNode};
  receipts?: IReceipt[];
  children: ReactNode;
  onCreateReceipt?(): void;
};

export const ReceiptingContainer = ({
  receipts,
  children,
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

  const handleCreateReceipt = useCallback(() => {
    onCreateReceipt && onCreateReceipt();
  }, [onCreateReceipt]);

  return (
    <SafeAreaView
      style={applyStyles('flex-1', {backgroundColor: colors.white})}>
      <HomeContainer onCreateReceipt={handleCreateReceipt}>
        {children}
        <FlatList
          data={receipts}
          initialNumToRender={10}
          renderItem={renderReceiptItem}
          keyboardShouldPersistTaps="always"
          keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
          ListEmptyComponent={
            <EmptyState
              heading="No Sales"
              text={emptyStateText}
              style={applyStyles({paddingTop: 100})}
            />
          }
        />
      </HomeContainer>
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
  onPress?: () => void;
};

export const ReceiptListItem = ({
  receipt,
  handleListItemSelect,
  getReceiptItemLeftText,
  onPress,
}: ReceiptListItemProps) => {
  const allPayments = receipt ? getAllPayments({receipt}) : [];
  const totalAmountPaid = allPayments.reduce(
    (total, payment) => total + payment.amount_paid,
    0,
  );
  let amountTextStyle = applyStyles('text-700', {
    fontSize: 16,
    color: colors['gray-300'],
  });

  if (receipt.total_amount !== totalAmountPaid) {
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
          ? () => {
              onPress?.();
              handleListItemSelect(receipt._id);
            }
          : undefined
      }>
      <View
        style={applyStyles('px-md flex-row center justify-between', {
          height: 52,
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
