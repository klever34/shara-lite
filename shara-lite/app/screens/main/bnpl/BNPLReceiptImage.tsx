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
import {IReceipt} from '@/models/Receipt';
import {IBNPLDrawdown} from '@/models/BNPLDrawdown';
import {IBNPLRepayment} from '@/models/BNPLRepayment';
import {IBNPLApproval} from '@/models/BNPLApproval';
import {sortBy} from 'lodash';

const strings = getI18nService().strings;

type Props = {
  transaction: {
    receiptData?: IReceipt;
    drawdown: IBNPLDrawdown;
    approval?: IBNPLApproval;
    repayments?: IBNPLRepayment[];
  };
  containerStyle?: ViewStyle;
  getImageUri: (base64: string) => void;
};

export const BNPLReceiptImage = memo((props: Props) => {
  const {transaction, getImageUri} = props;
  const {receiptData, repayments, drawdown} = transaction;
  const {
    _id,
    note,
    customer,
    created_at,
    amount_paid,
    total_amount,
    credit_amount,
  } = receiptData ?? {};
  const {repayment_amount} = drawdown;

  const receiptNo = _id?.toString().substring(0, 6);

  const viewShot = useRef<any>(null);
  const {callingCode} = useIPGeolocation();

  const user = getAuthService().getUser();
  const businessInfo = getAuthService().getBusinessInfo();
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
                  created_at ? new Date(created_at) : new Date(),
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
              {strings('paid')}: {amountWithCurrency(amount_paid)}
            </Text>
          </View>

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
                {amountWithCurrency(repayment_amount)}
              </Text>
            </View>
            <View>
              {sortBy(repayments, 'batch_no')?.map(
                ({batch_no, due_at, status, amount_owed, repayment_amount}) => (
                  <View
                    key={batch_no}
                    style={applyStyles(
                      'py-16 flex-row items-center justify-between',
                    )}>
                    <Text style={applyStyles('print-text-400 text-xl')}>
                      {batch_no}.{' '}
                      {format(
                        due_at ? new Date(due_at) : new Date(),
                        'dd MMM yyyy',
                      )}
                      {status === 'complete' ? ` (${strings('paid')})` : ''}
                    </Text>
                    <Text style={applyStyles('print-text-400 text-xl')}>
                      {status === 'pending' || 'complete'
                        ? amountWithCurrency(repayment_amount)
                        : amountWithCurrency(amount_owed || repayment_amount)}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </View>
        </View>
      </ViewShot>
    </ScrollView>
  );
});
