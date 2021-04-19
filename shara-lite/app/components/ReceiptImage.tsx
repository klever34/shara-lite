import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {getAuthService} from '@/services';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React, {memo, useCallback, useEffect, useRef} from 'react';
import {Text} from '@/components';
import {Image, ScrollView, View, ViewStyle} from 'react-native';
import ViewShot from 'react-native-view-shot';
import RNFetchBlob from 'rn-fetch-blob';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

type Props = {
  note?: string;
  createdAt?: Date;
  receiptNo?: string;
  amountPaid?: number;
  customer?: ICustomer;
  totalAmount?: number;
  creditDueDate?: Date;
  creditAmount?: number;
  containerStyle?: ViewStyle;
  getImageUri: (base64: string) => void;
};

export const ReceiptImage = memo((props: Props) => {
  const {
    note,
    customer,
    createdAt,
    receiptNo,
    amountPaid,
    totalAmount,
    getImageUri,
    creditAmount,
    creditDueDate,
  } = props;
  const viewShot = useRef<any>(null);

  const user = getAuthService().getUser();
  const businessInfo = getAuthService().getBusinessInfo();
  const {callingCode} = useIPGeolocation();
  console.log({businessInfo});

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

  const onImageLoad = useCallback(() => {
    viewShot.current.capture().then(onCapture);
  }, [onCapture]);

  useEffect(() => {
    viewShot.current.capture().then(onCapture);
  }, [customer, creditDueDate, creditAmount, onCapture, businessInfo]);

  return (
    <ScrollView>
      <ViewShot ref={viewShot} options={{format: 'png'}}>
        <View
          style={applyStyles('px-lg flex-1', {
            backgroundColor: colors.white,
          })}>
          <View style={applyStyles('py-lg items-center justify-center')}>
            {!!businessInfo?.profile_image?.url && (
              <Image
                onLoad={onImageLoad}
                style={applyStyles('mb-4 items-center justify-center', {
                  width: 80,
                  height: 80,
                  borderRadius: 16,
                  backgroundColor: colors['gray-20'],
                })}
                source={{uri: businessInfo?.profile_image?.url}}
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
            style={applyStyles('flex-row items-center justify-between py-sm', {
              borderRadius: 1,
              borderBottomWidth: 1,
              borderStyle: 'dashed',
              borderBottomColor: colors.black,
            })}>
            <View style={applyStyles('pb-sm flex-row items-center')}>
              <Text style={applyStyles('print-text-400 text-black text-lg')}>
                {strings('receipts.receipt_no')}:
              </Text>
              <Text
                style={applyStyles('pl-sm print-text-400 text-black text-lg')}>
                {receiptNo}
              </Text>
            </View>
            <View style={applyStyles('pb-sm flex-row items-center')}>
              <Text
                style={applyStyles('pl-sm print-text-400 text-lg texy-black')}>
                {format(
                  createdAt ? new Date(createdAt) : new Date(),
                  'dd/MM/yyyy',
                )}
              </Text>
            </View>
          </View>
          <View style={applyStyles('py-16')}>
            {!!customer?.name && (
              <View style={applyStyles('pb-16 flex-row items-center')}>
                <Text style={applyStyles('print-text-400 text-black text-lg')}>
                  {strings('receipts.receipt_for')}:
                </Text>
                <Text
                  style={applyStyles(
                    'pl-sm print-text-400 text-black text-lg',
                  )}>
                  {customer?.name}
                </Text>
              </View>
            )}
            {!!note && (
              <View>
                <Text
                  style={applyStyles('pb-4 print-text-400 text-black text-lg')}>
                  {note}
                </Text>
              </View>
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
                'print-text-400 pb-8 text-2xl text-uppercase',
              )}>
              {strings('total')}: {amountWithCurrency(totalAmount)}
            </Text>
            <Text
              style={applyStyles(
                'print-text-400 pb-8 text-2xl text-uppercase',
              )}>
              {strings('paid')}: {amountWithCurrency(amountPaid)}
            </Text>
            {!!creditAmount && (
              <Text
                style={applyStyles('print-text-400 text-2xl text-uppercase')}>
                {strings('balance')}: {amountWithCurrency(creditAmount)}
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
              style={applyStyles('print-text-400 pb-8 text-sm text-uppercase')}>
              {strings('create_receipts_with_shara')}
            </Text>
            <Text style={applyStyles('print-text-400 text-sm')}>
              www.shara.co
            </Text>
          </View>
        </View>
      </ViewShot>
    </ScrollView>
  );
});
