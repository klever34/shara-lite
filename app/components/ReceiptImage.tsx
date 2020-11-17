import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IReceiptItem} from '@/models/ReceiptItem';
import {getAuthService} from '@/services';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React, {useCallback} from 'react';
import {FlatList, ScrollView, Text, View, ViewStyle, Image} from 'react-native';
import ViewShot, {ViewShotProperties} from 'react-native-view-shot';
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
  captureMode?: ViewShotProperties['captureMode'];
};

export const ReceiptImage = (props: Props) => {
  const {
    user,
    products,
    createdAt,
    receiptNo,
    amountPaid,
    totalAmount,
    getImageUri,
    creditAmount,
    captureMode,
  } = props;

  const businessInfo = getAuthService().getBusinessInfo();
  const {callingCode} = useIPGeolocation();
  const code = businessInfo.country_code || user?.country_code || callingCode;
  const getBusinessMobile = useCallback(() => {
    if (businessInfo.mobile) {
      return businessInfo.mobile.startsWith(code)
        ? `+${businessInfo.mobile}`
        : `+${code}${businessInfo.mobile}`;
    }
    return user?.mobile.startsWith(code)
      ? `+${user?.mobile}`
      : `+${code}${user?.mobile}`;
  }, [businessInfo.mobile, code, user]);

  const onCapture = useCallback(
    async (uri: any) => {
      RNFetchBlob.fs.readFile(uri, 'base64').then((data) => {
        getImageUri(data);
      });
    },
    [getImageUri],
  );

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

  return (
    <ScrollView>
      <ViewShot
        onCapture={onCapture}
        captureMode={captureMode}
        options={{format: 'png'}}>
        <View
          style={applyStyles('px-lg flex-1', {
            backgroundColor: colors.white,
          })}>
          <>
            <View style={applyStyles('py-lg items-center justify-center')}>
              {!!businessInfo?.profile_image?.url && (
                <Image
                  style={applyStyles('mb-4 items-center justify-center', {
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    backgroundColor: colors['gray-20'],
                  })}
                  source={{uri: businessInfo?.profile_image.url}}
                />
              )}
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
                  Tel: {getBusinessMobile()}
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
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => `${item._id}`}
          />
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
        </View>
      </ViewShot>
    </ScrollView>
  );
};
