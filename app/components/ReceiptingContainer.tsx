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
  onCreateReceipt?(): void;
};

export const ReceiptingContainer = ({
  receipts,
  handleListItemSelect,
  getReceiptItemLeftText,
  emptyStateText,
  children,
  onCreateReceipt,
}: ReceiptingContainerProps) => {
  const renderReceiptItem = useCallback(
    ({item}: {item: IReceipt}) => {
      let amountTextStyle = applyStyles('text-700', {
        fontSize: 16,
        color: colors['gray-300'],
      });

      if (!item.isPaid) {
        amountTextStyle = {...amountTextStyle, color: colors['red-200']};
      }

      if (item.is_cancelled) {
        amountTextStyle = {
          ...amountTextStyle,
          ...applyStyles('text-400'),
          fontStyle: 'italic',
          color: colors['gray-100'],
          textDecorationLine: 'line-through',
        };
      }

      return (
        <Touchable
          onPress={
            handleListItemSelect
              ? () => handleListItemSelect(item._id)
              : undefined
          }>
          <View
            style={applyStyles('px-md flex-row center justify-space-between', {
              height: 50,
              borderBottomWidth: 1,
              borderBottomColor: colors['gray-20'],
            })}>
            <View>
              <Text
                {...getReceiptItemLeftText(
                  item,
                  applyStyles('text-400', {
                    fontSize: 16,
                    color: colors['gray-300'],
                  }),
                )}
              />
            </View>
            <View>
              <Text style={amountTextStyle}>
                {amountWithCurrency(item.total_amount)}
              </Text>
            </View>
          </View>
        </Touchable>
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
        style={applyStyles('flex-row center justify-space-between px-md', {
          height: 80,
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
                  'text-400 text-uppercase pl-sm text-sm text-white',
                )}>
                Create receipt
              </Text>
            </View>
          </Button>
        </View>
        <View style={applyStyles({width: '48%'})}>
          <Button onPress={() => {}} variantColor="clear">
            <View style={applyStyles('flex-row center')}>
              <Icon
                size={24}
                name="camera"
                type="feathericons"
                color={colors['gray-300']}
              />
              <Text
                style={applyStyles(
                  'text-400 text-uppercase pl-sm text-sm text-gray-300',
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
