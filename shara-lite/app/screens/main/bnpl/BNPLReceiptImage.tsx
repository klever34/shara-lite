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
  transaction: {
    _id?: string;
    note?: string;
    createdAt?: Date;
    amount_paid?: number;
    customer?: ICustomer;
    total_amount?: number;
    credit_amount?: number;
  };
  containerStyle?: ViewStyle;
  getImageUri: (base64: string) => void;
};

export const BNPLReceiptImage = memo((props: Props) => {
  const {transaction, getImageUri} = props;
  const {
    _id,
    note,
    customer,
    createdAt,
    amount_paid,
    total_amount,
    credit_amount,
  } = transaction;

  const receiptNo = _id?.toString().substring(0, 6);

  const viewShot = useRef<any>(null);

  const user = getAuthService().getUser();
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

  const onImageLoad = useCallback(() => {
    viewShot.current.capture().then(onCapture);
  }, [onCapture]);

  useEffect(() => {
    viewShot.current.capture().then(onCapture);
  }, [
    customer,
    amount_paid,
    total_amount,
    credit_amount,
    onCapture,
    businessInfo,
  ]);

  return (
    <ScrollView>
      <ViewShot ref={viewShot} options={{format: 'png'}}>
        <View style={applyStyles('px-lg flex-1 bg-white')}>
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
            style={applyStyles('flex-row items-center justify-between pb-8')}>
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
          {!!customer?.name && (
            <View
              style={applyStyles('flex-row items-center justify-between pb-8')}>
              <View style={applyStyles('pb-sm flex-row items-center')}>
                <Text style={applyStyles('print-text-400 text-black text-lg')}>
                  {strings('client.one')}:
                </Text>
                <Text
                  style={applyStyles(
                    'pl-sm print-text-400 text-black text-lg',
                  )}>
                  {customer?.name}
                </Text>
              </View>
            </View>
          )}
          {!!note && (
            <Text style={applyStyles('pb-4 print-text-700 text-black text-lg')}>
              {note}
            </Text>
          )}
          <View
            style={applyStyles('py-16', {
              borderRadius: 1,
              borderBottomWidth: 1,
              borderStyle: 'dashed',
              borderBottomColor: colors.black,
            })}>
            <Text style={applyStyles('print-text-400 pb-8 text-lg')}>
              {strings('total')}: {amountWithCurrency(total_amount)}
            </Text>
            <Text style={applyStyles('print-text-400 pb-8 text-lg')}>
              {strings('paid')}: {amountWithCurrency(amount_paid)}
            </Text>
          </View>

          {!!credit_amount && (
            <View
              style={applyStyles('py-16', {
                borderRadius: 1,
                borderBottomWidth: 1,
                borderStyle: 'dashed',
                borderBottomColor: colors.black,
              })}>
              <Text style={applyStyles('print-text-400 text-lg')}>
                {strings('balance')}: {amountWithCurrency(credit_amount)}
              </Text>
            </View>
          )}
          <View>
            <View
              style={applyStyles(
                'py-16 flex-row items-center justify-between',
                {
                  borderRadius: 1,
                  borderBottomWidth: 1,
                  borderStyle: 'dashed',
                  borderBottomColor: colors.black,
                },
              )}>
              <Text style={applyStyles('print-text-400 text-xl')}>
                {strings('bnpl.receipt.bnpl_text')}
              </Text>
              <Text style={applyStyles('print-text-400 text-xl')}>
                {amountWithCurrency(0)}
              </Text>
            </View>
            <View>
              <View
                style={applyStyles(
                  'py-16 flex-row items-center justify-between',
                )}>
                <Text style={applyStyles('print-text-400 text-xl')}>
                  1. {format(new Date(), 'dd MMM yyyy')} ({strings('paid')})
                </Text>
                <Text style={applyStyles('print-text-400 text-xl')}>
                  {amountWithCurrency(0)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ViewShot>
    </ScrollView>
  );
});
