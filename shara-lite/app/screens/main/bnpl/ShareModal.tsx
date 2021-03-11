import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {getAnalyticsService, getI18nService} from '@/services';
import {ShareHookProps, useShare} from '@/services/share';
import {applyStyles, colors} from '@/styles';
import React, {useCallback} from 'react';
import {Text, View} from 'react-native';

const strings = getI18nService().strings;

type ShareModalProps = {
  onClose(): void;
  transaction: any;
};

export const ShareModal = (props: ShareModalProps) => {
  const {transaction} = props;

  const analyticsService = getAnalyticsService();
  const shareReceiptMessage = ``;
  const receiptShareProps: ShareHookProps = {
    // image: receiptImage,
    message: shareReceiptMessage,
    recipient: transaction?.customer?.mobile,
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
        item_id: transaction?._id?.toString() ?? '',
        content_type: 'share-receipt',
      })
      .then(() => {});
    handleSmsShare();
  }, [analyticsService, handleSmsShare, transaction]);

  const onWhatsappShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'whatsapp',
        content_type: 'share-receipt',
        item_id: transaction?._id?.toString() ?? '',
      })
      .then(() => {});
    handleWhatsappShare();
  }, [analyticsService, handleWhatsappShare, transaction]);

  const onOthersShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'others',
        content_type: 'share-receipt',
        item_id: transaction?._id?.toString() ?? '',
      })
      .then(() => {});
    handleEmailShare();
  }, [analyticsService, handleEmailShare, transaction]);

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
    </View>
  );
};
