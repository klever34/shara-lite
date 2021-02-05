import {Button, DatePicker} from '@/components';
import {Icon} from '@/components/Icon';
import {ReceiptImage} from '@/components/ReceiptImage';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {getAnalyticsService, getAuthService, getI18nService} from '@/services';
import {ShareHookProps, useShare} from '@/services/share';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import LottieView from 'lottie-react-native';
import React, {useCallback, useState} from 'react';
import {Image, Text, View} from 'react-native';
import Markdown from 'react-native-markdown-display';

const strings = getI18nService().strings;

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

  const showCollectionDate =
    !transaction.is_collection &&
    transaction.customer &&
    (transaction.credit_amount || dueDate);

  const shareReceiptMessage = strings('receipts.receipt_share_message', {
    customer_name: transaction.customer?.name,
    from_who: businessInfo.name,
    amount: amountWithCurrency(transaction.amount_paid),
    credit_message: '',
  });

  const receiptShareProps: ShareHookProps = {
    image: receiptImage,
    title: strings('receipts.receipt_share_title'),
    subject: strings('receipts.receipt_share_title'),
    message: shareReceiptMessage,
    recipient: transaction?.customer?.mobile,
  };
  const {handleSmsShare, handleEmailShare, handleWhatsappShare} = useShare(
    receiptShareProps,
  );

  const onSmsShare = useCallback(() => {    
    console.log('here');

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
            style={applyStyles({
              height: '100%',
              width: '100%',
            })}
          />
        </View>
        {!!showShareButtons && (
          <View style={applyStyles('center')}>
            <View style={applyStyles('flex-row items-center')}>
              <Text
                style={applyStyles(
                  'px-4 text-sm text-uppercase text-gray-300 text-700 text-center',
                )}>
                {strings('share')}:
              </Text>
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
                      {strings('other')}
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
          <Markdown
            style={{
              body: applyStyles('text-gray-100 text-uppercase'),
              strong: applyStyles('text-red-200 text-700'),
            }}>
            {strings('transaction.collect_on_date', {
              date: format(dueDate, 'dd MMM, yyyy'),
            })}
          </Markdown>
        </View>
      )}
      <View
        style={applyStyles(
          `px-16 pt-16 bg-white flex-row items-center ${
            showCollectionDate ? 'justify-between' : 'justify-center'
          }`,
        )}>
        {showCollectionDate && (
          <DatePicker
            //@ts-ignore
            minimumDate={new Date()}
            value={dueDate ?? new Date()}
            containerStyle={applyStyles({width: '100%'})}
            onChange={(e: Event, date?: Date) => handleDueDateChange(date)}>
            {(toggleShow) => (
              <Button
                onPress={toggleShow}
                variantColor="transparent"
                style={applyStyles({width: '100%'})}
                title={
                  dueDate
                    ? strings('transaction.change_collection_date')
                    : strings('transaction.collection_date')
                }
              />
            )}
          </DatePicker>
        )}
        <Button
          title={strings('done')}
          onPress={onDone}
          style={applyStyles({width: '100%'})}
        />
      </View>
      <View
        style={applyStyles({
          opacity: 0,
          height: 0,
        })}>
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
