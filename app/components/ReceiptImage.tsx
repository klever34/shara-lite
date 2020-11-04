import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IReceiptItem} from '@/models/ReceiptItem';
import {getAuthService} from '@/services';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React, {useCallback, useEffect, useRef} from 'react';
import {FlatList, Text, View, ViewStyle} from 'react-native';
import {captureRef} from 'react-native-view-shot';
import RNFetchBlob from 'rn-fetch-blob';
import {User} from 'types/app';

type Props = {
  tax?: number;
  createdAt?: Date;
  user: User | null;
  receiptNo?: string;
  amountPaid?: number;
  customer?: ICustomer;
  totalAmount?: number;
  creditDueDate?: Date;
  creditAmount?: number;
  isCancelled?: boolean;
  products?: IReceiptItem[];
  containerStyle?: ViewStyle;
  getImageUri: (base64: string) => void;
};

export const ReceiptImage = (props: Props) => {
  const {
    user,
    customer,
    products,
    createdAt,
    receiptNo,
    amountPaid,
    totalAmount,
    getImageUri,
    creditAmount,
    containerStyle,
  } = props;

  const businessInfo = getAuthService().getBusinessInfo();
  const viewRef = useRef<any>(null);

  const onCapture = useCallback(async () => {
    captureRef(viewRef, {
      format: 'png',
    }).then(
      (uri) => {
        RNFetchBlob.fs.readFile(uri, 'base64').then((data) => {
          getImageUri(data);
        });
      },
      (error) => console.error('Oops, snapshot failed', error),
    );
  }, [getImageUri]);

  const renderItem = useCallback(({item}: {item: IReceiptItem}) => {
    const price = item.price ? item.price : 0;
    const quantity = item.quantity ? item.quantity : 0;
    const subtotal = price * quantity;

    return (
      <View
        style={applyStyles('px-16 pb-8 flex-row items-center justify-between')}>
        <View>
          <Text style={applyStyles('print-text-400 text-lg text-black')}>
            {quantity} x {item.product.name}
          </Text>
        </View>
        <View>
          <Text style={applyStyles('print-text-400 text-lg text-black')}>
            {amountWithCurrency(subtotal)}
          </Text>
        </View>
      </View>
    );
  }, []);

  useEffect(() => {
    if (customer?.name) {
      onCapture();
    }
  }, [customer, onCapture]);

  return (
    <View
      style={applyStyles('flex-1', {
        backgroundColor: colors.white,
        ...containerStyle,
      })}
      ref={viewRef}>
      <FlatList
        data={products}
        renderItem={renderItem}
        style={applyStyles('mt-lg')}
        keyExtractor={(item) => `${item._id}`}
        ListHeaderComponent={
          <>
            <View style={applyStyles('py-lg items-center justify-center')}>
              {!!businessInfo.name && (
                <Text
                  style={applyStyles(
                    'pb-xs text-2xl text-black print-text-400 text-center text-uppercase',
                  )}>
                  {businessInfo?.name}
                </Text>
              )}
              {!!businessInfo.name && (
                <Text
                  style={applyStyles(
                    'print-text-400 pb-xs text-base text-center text-black',
                  )}>
                  Tel: +{businessInfo?.mobile || user?.mobile}
                </Text>
              )}
              {!!businessInfo.address && (
                <Text
                  style={applyStyles(
                    'print-text-400 pb-xs text-base text-center text-black',
                  )}>
                  {businessInfo?.address}
                </Text>
              )}
            </View>
            <View
              style={applyStyles(
                'flex-row items-center justify-between py-sm px-lg',
                {
                  borderRadius: 1,
                  borderBottomWidth: 1,
                  borderStyle: 'dashed',
                  borderBottomColor: colors.black,
                },
              )}>
              <View style={applyStyles('pb-sm flex-row items-center')}>
                <Text style={applyStyles('print-text-400 text-black text-lg')}>
                  Receipt No:
                </Text>
                <Text
                  style={applyStyles(
                    'pl-sm print-text-400 text-black text-lg',
                  )}>
                  {receiptNo}
                </Text>
              </View>
              <View style={applyStyles('pb-sm flex-row items-center')}>
                <Text
                  style={applyStyles(
                    'pl-sm print-text-400 text-lg texy-black',
                  )}>
                  {format(
                    createdAt ? new Date(createdAt) : new Date(),
                    'dd/MM/yyyy',
                  )}
                </Text>
              </View>
            </View>
          </>
        }
        ListFooterComponent={
          <>
            <View
              style={applyStyles('center py-16', {
                borderRadius: 1,
                borderTopWidth: 1,
                borderStyle: 'dashed',
                borderTopColor: colors.black,
              })}>
              <Text style={applyStyles('print-text-400 pb-8 text-2xl')}>
                Total: {amountWithCurrency(totalAmount)}
              </Text>
              <Text style={applyStyles('print-text-400 pb-8 text-2xl')}>
                Paid: {amountWithCurrency(amountPaid)}
              </Text>
              {!!creditAmount && (
                <Text style={applyStyles('print-text-400 text-2xl')}>
                  Balance: {amountWithCurrency(creditAmount)}
                </Text>
              )}
            </View>
            <View
              style={applyStyles('center py-16', {
                borderRadius: 1,
                borderTopWidth: 1,
                borderStyle: 'dashed',
                borderTopColor: colors.black,
              })}>
              <Text
                style={applyStyles(
                  'print-text-400 pb-8 text-sm text-uppercase',
                )}>
                create receipts for free with shara
              </Text>
              <Text style={applyStyles('print-text-400 text-sm')}>
                www.shara.co
              </Text>
            </View>
          </>
        }
      />
    </View>
  );
};
