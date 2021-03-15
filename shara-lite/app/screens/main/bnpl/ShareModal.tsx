import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IBNPLDrawdown} from '@/models/BNPLDrawdown';
import {IReceipt} from '@/models/Receipt';
import {getAnalyticsService, getAuthService, getI18nService} from '@/services';
import {ShareHookProps, useShare} from '@/services/share';
import {applyStyles, colors} from '@/styles';
import format from 'date-fns/format';
import React, {useCallback, useState} from 'react';
import {Text, View} from 'react-native';
import Config from 'react-native-config';
import {BNPLReceiptImage} from './BNPLReceiptImage';

const strings = getI18nService().strings;

type ShareModalProps = {
  onClose(): void;
  transaction: {drawdown: IBNPLDrawdown; receiptData?: IReceipt};
};

export const ShareModal = (props: ShareModalProps) => {
  const {transaction} = props;
  const {drawdown, receiptData} = transaction;

  const [receiptImage, setReceiptImage] = useState('');

  const analyticsService = getAnalyticsService();

  const user = getAuthService().getUser();
  const businessInfo = getAuthService().getBusinessInfo();

  const activeRepayments = drawdown.bnpl_repayments
    ?.filtered('status != "completed"')
    .sorted('batch_no', false);
  const nextRepayment = activeRepayments && activeRepayments[0];
  const paymentLink =
    businessInfo.slug &&
    `${Config.WEB_BASE_URL}/pay/${businessInfo.slug}${
      drawdown.customer?._id
        ? `?customer=${String(drawdown.customer?._id)}`
        : ''
    }`;
  const shareReceiptMessage = `${
    businessInfo.name || user?.firstname
      ? strings('bnpl.recent_purchase_message_from_business', {
          customer_name: drawdown.customer?.name ?? '',
          business_name: businessInfo.name || user?.firstname,
        })
      : strings('bnpl.recent_purchase_message', {
          customer_name: drawdown.customer?.name ?? '',
        })
  } ${strings('bnpl.you_paid_message', {
    amount: amountWithCurrency(receiptData?.amount_paid),
  })} ${strings('bnpl.you_owe_message', {
    credit_amount: amountWithCurrency(receiptData?.credit_amount),
  })}  ${strings('bnpl.next_repayment', {
    date: format(
      nextRepayment?.due_at ? new Date(nextRepayment?.due_at) : new Date(),
      'dd MMM yyyy',
    ),
    amount: amountWithCurrency(drawdown?.payment_frequency_amount),
  })} ${
    paymentLink
      ? strings('payment_link_message', {
          payment_link: paymentLink,
        })
      : ''
  }\n\n${strings('powered_by_shara')}`;
  const receiptShareProps: ShareHookProps = {
    image: receiptImage,
    message: shareReceiptMessage,
    recipient: receiptData?.customer?.mobile,
    title: strings('receipts.receipt_share_title'),
    subject: strings('receipts.receipt_share_title'),
  };

  const {handleSmsShare, handleEmailShare, handleWhatsappShare} = useShare(
    receiptShareProps,
  );

  const onSmsShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'sms',
        item_id: receiptData?._id?.toString() ?? '',
        content_type: 'share-receipt',
      })
      .then(() => {});
    handleSmsShare();
  }, [analyticsService, handleSmsShare, receiptData]);

  const onWhatsappShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'whatsapp',
        content_type: 'share-receipt',
        item_id: receiptData?._id?.toString() ?? '',
      })
      .then(() => {});
    handleWhatsappShare();
  }, [analyticsService, handleWhatsappShare, receiptData]);

  const onOthersShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'others',
        content_type: 'share-receipt',
        item_id: receiptData?._id?.toString() ?? '',
      })
      .then(() => {});
    handleEmailShare();
  }, [analyticsService, handleEmailShare, receiptData]);

  return (
    <View style={applyStyles('py-40 center')}>
      <Text
        style={applyStyles(
          'pb-16 text-center text-700 text-uppercase text-gray-300',
        )}>
        {strings('bnpl.share_receipt')}
      </Text>
      <View style={applyStyles('flex-row items-center px-24')}>
        <Touchable onPress={onWhatsappShare}>
          <View style={applyStyles('center', {width: '33.33%'})}>
            <Icon
              size={32}
              type="ionicons"
              name="logo-whatsapp"
              color={colors.whatsapp}
            />
            <Text
              style={applyStyles(
                'pt-12 text-center text-capitalize text-gray-200',
              )}>
              {strings('whatsapp')}
            </Text>
          </View>
        </Touchable>
        <Touchable onPress={onSmsShare}>
          <View style={applyStyles('center', {width: '33.33%'})}>
            <Icon
              size={32}
              type="feathericons"
              name="message-circle"
              color={colors['blue-100']}
            />
            <Text
              style={applyStyles(
                'pt-12 text-center text-uppercase text-gray-200',
              )}>
              {strings('sms')}
            </Text>
          </View>
        </Touchable>
        <Touchable onPress={onOthersShare}>
          <View style={applyStyles('center', {width: '33.33%'})}>
            <Icon
              size={32}
              type="feathericons"
              name="more-vertical"
              color={colors['blue-100']}
            />
            <Text
              style={applyStyles(
                'pt-12 text-center text-capitalize text-gray-200',
              )}>
              {strings('other')}
            </Text>
          </View>
        </Touchable>
      </View>
      <View
        style={applyStyles({
          opacity: 0,
          height: 0,
        })}>
        <BNPLReceiptImage
          transaction={{
            drawdown,
            receiptData,
            repayments: drawdown.bnpl_repayments?.map((item) => item),
          }}
          getImageUri={(data) => setReceiptImage(data)}
        />
      </View>
    </View>
  );
};
