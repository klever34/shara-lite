import EmptyState from 'app-v3/components/EmptyState';
import Touchable from 'app-v3/components/Touchable';
import {amountWithCurrency} from 'app-v3/helpers/utils';
import {IReceipt} from 'app-v3/models/Receipt';
import {getAllPayments} from 'app-v3/services/ReceiptService';
import {colors} from 'app-v3/styles';
import React, {ReactNode, useCallback} from 'react';
import {Alert, SafeAreaView, Text, TextStyle, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {HomeContainer} from './HomeContainer';
import {applyStyles} from 'app-v3/styles';

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
  onSnapReceipt?(callback: (imageUri: string) => void): void;
};

export const ReceiptingContainer = ({
  receipts,
  children,
  // onSnapReceipt,
  emptyStateText,
  onCreateReceipt,
  handleListItemSelect,
  getReceiptItemLeftText,
}: ReceiptingContainerProps) => {
  // const realm = useRealm();

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

  const handleSnapReceipt = useCallback(() => {
    Alert.alert('Coming Soon', 'This feature is coming in the next update');
    // onSnapReceipt?.((uri) =>
    //   saveReceipt({
    //     realm,
    //     tax: 0,
    //     payments: [],
    //     amountPaid: 0,
    //     totalAmount: 0,
    //     creditAmount: 0,
    //     receiptItems: [],
    //     local_image_url: uri,
    //     customer: {} as ICustomer,
    //   }),
    // );
  }, []);

  return (
    <SafeAreaView
      style={applyStyles('flex-1', {backgroundColor: colors.white})}>
      <HomeContainer
        onSnapReceipt={handleSnapReceipt}
        onCreateReceipt={handleCreateReceipt}>
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
