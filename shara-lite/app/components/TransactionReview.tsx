import {Button, DatePicker} from '@/components';
import {Icon} from '@/components/Icon';
import {ReceiptImage} from '@/components/ReceiptImage';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {getAnalyticsService, getAuthService} from '@/services';
import {ShareHookProps, useShare} from '@/services/share';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import LottieView from 'lottie-react-native';
import React, {useCallback, useState} from 'react';
import {Image, Text, View} from 'react-native';

type TransactionReviewProps = {
  heading?: string;
  subheading?: string;
  onDone?: () => void;
  transaction: IReceipt;
  showAnimation?: boolean;
  showShareButtons?: boolean;
};

export const TransactionReview = (props: TransactionReviewProps) => {
  const {
    onDone,
    heading,
    subheading,
    transaction,
    showAnimation = true,
    showShareButtons = true,
  } = props;

  const analyticsService = getAnalyticsService();
  const businessInfo = getAuthService().getBusinessInfo();
  const {updateDueDate} = useTransaction();

  const [receiptImage, setReceiptImage] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    transaction?.customer?.due_date,
  );

  const shareReceiptMessage = `Hi ${
    transaction.customer?.name ?? ''
  }, thank you for your recent purchase from ${
    businessInfo.name
  }. You paid ${amountWithCurrency(
    transaction.amount_paid,
  )}.\n\nPowered by Shara for free.\nwww.shara.co`;

  const receiptShareProps: ShareHookProps = {
    image: receiptImage,
    title: 'Share Receipt',
    subject: 'Share Receipt',
    message: shareReceiptMessage,
    recipient: transaction?.customer?.mobile,
  };
  const {handleSmsShare, handleEmailShare, handleWhatsappShare} = useShare(
    receiptShareProps,
  );

  const onSmsShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'sms',
        item_id: transaction?._id?.toString() ?? '',
        content_type: transaction.isPaid ? 'share-receipt' : 'payment-reminder',
      })
      .then(() => {});
    handleSmsShare();
  }, [analyticsService, handleSmsShare, transaction]);

  const onWhatsappShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'whatsapp',
        item_id: transaction?._id?.toString() ?? '',
        content_type: transaction.isPaid ? 'share-receipt' : 'payment-reminder',
      })
      .then(() => {});
    handleWhatsappShare();
  }, [analyticsService, handleWhatsappShare, transaction]);

  const onOthersShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'others',
        item_id: transaction?._id?.toString() ?? '',
        content_type: transaction.isPaid ? 'share-receipt' : 'payment-reminder',
      })
      .then(() => {});
    handleEmailShare();
  }, [analyticsService, transaction, handleEmailShare]);

  const handleDueDateChange = useCallback(
    async (date?: Date) => {
      if (date) {
        setDueDate(date);
        if (transaction && transaction.customer) {
          try {
            await updateDueDate({
              due_date: date,
              customer: transaction?.customer,
            });
          } catch (e) {
            console.log(e);
          }
        }
      }
    },
    [transaction, updateDueDate],
  );

  return (
    <View style={applyStyles('pt-24 pb-16 bg-white flex-1')}>
      <View style={applyStyles('items-center ')}>
        <View style={applyStyles('pb-32 items-center')}>
          {!!showAnimation && (
            <View style={applyStyles('pb-8')}>
              <LottieView
                autoPlay
                style={applyStyles({width: 50})}
                source={require('@/assets/animations/success.json')}
              />
            </View>
          )}
          <Text style={applyStyles('text-black text-400 text-2xl text-center')}>
            {heading}
          </Text>
          <Text
            style={applyStyles('text-gray-200 text-400 text-base text-center')}>
            {subheading}
          </Text>
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
            style={applyStyles({height: '100%', width: '100%'})}
          />
        </View>
        {!!showShareButtons && (
          <View style={applyStyles('center')}>
            <Text
              style={applyStyles(
                'text-sm text-uppercase text-gray-300 text-700 text-center',
              )}>
              Share
            </Text>
            <View style={applyStyles('flex-row items-center')}>
              <View style={applyStyles('px-4')}>
                <Touchable onPress={onWhatsappShare}>
                  <View
                    style={applyStyles('px-2 flex-row center', {
                      height: 48,
                    })}>
                    <Icon
                      size={16}
                      type="ionicons"
                      name="logo-whatsapp"
                      color={colors.whatsapp}
                    />
                    <Text
                      style={applyStyles(
                        'pl-xs text-xs text-400 text-uppercase text-gray-200',
                      )}>
                      whatsapp
                    </Text>
                  </View>
                </Touchable>
              </View>
              <View style={applyStyles('px-4')}>
                <Touchable onPress={onSmsShare}>
                  <View
                    style={applyStyles('px-2 flex-row center', {
                      height: 48,
                    })}>
                    <Icon
                      size={16}
                      name="message-circle"
                      type="feathericons"
                      color={colors.primary}
                    />
                    <Text
                      style={applyStyles(
                        'pl-xs text-xs text-400 text-uppercase text-gray-200',
                      )}>
                      sms
                    </Text>
                  </View>
                </Touchable>
              </View>
              <View style={applyStyles('px-4')}>
                <Touchable onPress={onOthersShare}>
                  <View
                    style={applyStyles('px-2 flex-row center', {
                      height: 48,
                    })}>
                    <Icon
                      size={16}
                      type="feathericons"
                      name="more-vertical"
                      color={colors['red-100']}
                    />
                    <Text
                      style={applyStyles(
                        'pl-xs text-xs text-400 text-uppercase text-gray-200',
                      )}>
                      other
                    </Text>
                  </View>
                </Touchable>
              </View>
            </View>
          </View>
        )}
      </View>
      {dueDate && !transaction.is_collection && (
        <View style={applyStyles('flex-row center')}>
          <Text style={applyStyles('text-gray-100 text-uppercase')}>
            Collect on{' '}
          </Text>
          <Text style={applyStyles('text-red-200 text-700')}>
            {format(dueDate, 'dd MMM, yyyy')}
          </Text>
        </View>
      )}
      <View
        style={applyStyles(
          `px-16 pt-16 bg-white flex-row items-center ${
            !transaction.is_collection ? 'justify-between' : 'justify-center'
          }`,
        )}>
        {!transaction.is_collection && (
          <DatePicker
            //@ts-ignore
            minimumDate={new Date()}
            value={dueDate ?? new Date()}
            containerStyle={applyStyles({width: '48%'})}
            onChange={(e: Event, date?: Date) => handleDueDateChange(date)}>
            {(toggleShow) => (
              <Button
                onPress={toggleShow}
                variantColor="transparent"
                style={applyStyles({width: '100%'})}
                title={dueDate ? 'Change Collection Date' : 'Collection Date'}
              />
            )}
          </DatePicker>
        )}
        <Button
          title="Done"
          onPress={onDone}
          style={applyStyles({width: '48%'})}
        />
      </View>
      <View style={applyStyles({opacity: 0, height: 0})}>
        <ReceiptImage
          note={transaction?.note}
          customer={transaction?.customer}
          createdAt={transaction?.created_at}
          creditDueDate={transaction?.dueDate}
          amountPaid={transaction.amount_paid}
          totalAmount={transaction.total_amount}
          creditAmount={transaction.credit_amount}
          getImageUri={(data) => setReceiptImage(data)}
          receiptNo={transaction?._id?.toString().substring(0, 6)}
        />
      </View>
    </View>
  );
};
