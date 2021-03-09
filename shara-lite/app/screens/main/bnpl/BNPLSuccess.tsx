import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {getAnalyticsService, getI18nService} from '@/services';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useState} from 'react';
import {Image, ScrollView, Text, View, SafeAreaView} from 'react-native';
import LottieView from 'lottie-react-native';
import {ShareHookProps, useShare} from '@/services/share';
import {MainStackParamList} from '..';
import {RouteProp} from '@react-navigation/core';
import {Button} from '@/components';
import {BNPLReceiptImage} from './BNPLReceiptImage';
import {amountWithCurrency} from '@/helpers/utils';

type BNPLSuccessProps = MainStackParamList['BNPLTransactionSuccessScreen'] & {
  captions: {heading: string; outstanding: string; payment: string};
};

const strings = getI18nService().strings;

export const BNPLSuccess = (props: BNPLSuccessProps) => {
  const {onDone, transaction, captions} = props;
  const {credit_amount} = transaction;

  const [receiptImage, setReceiptImage] = useState('');

  const analyticsService = getAnalyticsService();
  const shareReceiptMessage = ``;
  const receiptShareProps: ShareHookProps = {
    image: receiptImage,
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
  }, [analyticsService, transaction, handleEmailShare]);

  return (
    <SafeAreaView style={applyStyles('bg-white flex-1')}>
      <ScrollView persistentScrollbar style={applyStyles('flex-1')}>
        <View style={applyStyles('items-center p-24')}>
          <View style={applyStyles('pb-24')}>
            <LottieView
              autoPlay
              style={applyStyles({width: 50})}
              source={require('@/assets/animations/success.json')}
            />
          </View>
          <Text
            style={applyStyles('pb-16 text-center text-black text-2xl', {
              width: 200,
            })}>
            {captions.heading}
          </Text>
          <Text style={applyStyles('pb-16 text-center text-gray-200 text-lg')}>
            {captions.outstanding}
          </Text>
          <Text style={applyStyles('text-center text-gray-200 text-lg')}>
            {captions.payment}
          </Text>
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
          <View
            style={applyStyles('mb-32 bg-white', {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 5,
              },
              shadowOpacity: 0.34,
              shadowRadius: 6.27,
              elevation: 10,
              height: 300,
              width: 180,
            })}>
            <Image
              resizeMode="center"
              source={{uri: `data:image/png;base64,${receiptImage}`}}
              style={applyStyles({
                height: '100%',
                width: '100%',
              })}
            />
          </View>
        </View>
      </ScrollView>
      <View
        style={applyStyles('p-24 flex-row justify-end border-t-1', {
          borderColor: colors['gray-20'],
        })}>
        <View style={applyStyles('flex-row items-center')}>
          <Button
            onPress={onDone}
            variantColor="blue"
            title={strings('done')}
            style={applyStyles({width: 120})}
            textStyle={applyStyles('text-uppercase')}
          />
        </View>
      </View>
      <View
        style={applyStyles({
          opacity: 0,
          height: 0,
        })}>
        <BNPLReceiptImage
          transaction={transaction}
          getImageUri={(data) => setReceiptImage(data)}
        />
      </View>
    </SafeAreaView>
  );
};
