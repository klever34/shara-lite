import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {Button, Text, toNumber} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {
  getAnalyticsService,
  getApiService,
  getAuthService,
  getI18nService,
} from '@/services';
import {ShareHookProps, useShare} from '@/services/share';
import {applyStyles, colors} from '@/styles';
import LottieView from 'lottie-react-native';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import Markdown from 'react-native-markdown-display';
import {STKPushConfirmation, STKPushDeposit} from '../money/MoneyDepositScreen';
import {useAppNavigation} from '@/services/navigation';
import Config from 'react-native-config';
import {parsePhoneNumber} from 'libphonenumber-js';
import {RouteProp} from '@react-navigation/core';
import {MainStackParamList} from '..';
import {handleError} from '@/services/error-boundary';

type RequestPaymentScreenProps = {
  route: RouteProp<MainStackParamList, 'RequestPaymentSuccess'>;
} & ModalWrapperFields;

const strings = getI18nService().strings;

export default withModal(function RequestPaymentSuccessScreen({
  route,
  openModal,
  closeModal,
}: RequestPaymentScreenProps) {
  const {customer, amount, note} = route.params;

  const navigation = useAppNavigation();
  const user = getAuthService().getUser();
  const analyticsService = getAnalyticsService();
  const businessInfo = getAuthService().getBusinessInfo();

  const shareReceiptMessage = `Hi ${customer.name}, ${
    businessInfo.name || user?.firstname
  } is requesting a payment of ${amountWithCurrency(amount)}${
    note ? ` for ${note}` : ''
  }. \n\nClick this link ${Config.WEB_BASE_URL}/pay/${
    businessInfo.slug
  }?amount=${amount}&mobile=${customer.mobile
    ?.replace('+', '')
    .replace(/\s/g, '')}&note=${encodeURIComponent(
    note ?? '',
  )}\nto make payment.\n\n${strings('powered_by_shara')}`;

  const receiptShareProps: ShareHookProps = {
    title: strings('receipts.receipt_share_title'),
    subject: strings('receipts.receipt_share_title'),
    message: shareReceiptMessage,
    recipient: customer?.mobile?.replace(/\s/g, ''),
  };
  const phoneNumber = customer?.mobile && parsePhoneNumber(customer?.mobile);
  //@ts-ignore
  const nationalNumber = (phoneNumber?.nationalNumber ?? '') as string;
  const {handleSmsShare, handleEmailShare, handleWhatsappShare} = useShare(
    receiptShareProps,
  );

  const onSmsShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'sms',
        item_id: '',
        content_type: 'share-payment-request',
      })
      .then(() => {});
    handleSmsShare();
  }, [analyticsService, handleSmsShare]);

  const onWhatsappShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'whatsapp',
        item_id: '',
        content_type: 'share-payment-request',
      })
      .then(() => {});
    handleWhatsappShare();
  }, [analyticsService, handleWhatsappShare]);

  const onOthersShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'others',
        item_id: '',
        content_type: 'share-payment-request',
      })
      .then(() => {});
    handleEmailShare();
  }, [analyticsService, handleEmailShare]);

  const handleCloseSTKPushConfirmation = useCallback(() => {
    closeModal();
    navigation.navigate('Home');
  }, [closeModal, navigation]);

  const handleSTKPush = useCallback(
    async ({mobile, amount}, setSubmitting) => {
      try {
        setSubmitting(true);
        await getApiService().stkPushDeposit({
          mobile,
          amount: toNumber(amount),
        });
        getAnalyticsService()
          .logEvent('initiateDepositSTKPush', {
            amount: toNumber(amount),
          })
          .then();
        setSubmitting(false);
        openModal('bottom-half', {
          renderContent: () => (
            <STKPushConfirmation
              mobile={customer?.mobile ?? ''}
              onClose={handleCloseSTKPushConfirmation}
            />
          ),
        });
      } catch (error) {
        setSubmitting(false);
        handleError(error);
      }
    },
    [openModal, closeModal],
  );

  const handleDeposit = useCallback(() => {
    openModal('bottom-half', {
      renderContent: () => (
        <STKPushDeposit
          onSubmit={handleSTKPush}
          onClose={closeModal}
          initialValues={{
            amount: amount?.toString() ?? '',
            mobile: nationalNumber ?? '',
          }}
        />
      ),
    });
  }, [handleSTKPush, nationalNumber, closeModal, openModal]);

  const handleDone = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  return (
    <View style={applyStyles('pt-24 pb-16 bg-white flex-1')}>
      <View style={applyStyles('items-center flex-1')}>
        <View style={applyStyles('flex-1 items-center justify-center')}>
          <View style={applyStyles('pb-32 items-center')}>
            <View style={applyStyles('pb-8')}>
              <LottieView
                autoPlay
                style={applyStyles({width: 50})}
                source={require('@/assets/animations/success.json')}
              />
            </View>
            <Text
              style={applyStyles('text-black text-400 text-2xl text-center')}>
              {strings('success')}
            </Text>
            <Markdown
              style={{
                textgroup: applyStyles(
                  'px-48 text-gray-200 text-400 text-base text-center',
                ),
                strong: applyStyles('text-gray-200 text-700'),
              }}>
              {strings('request_payment.success_text', {
                customer: customer.name,
                amount: amountWithCurrency(amount),
              })}
            </Markdown>
          </View>

          <View style={applyStyles('py-40 center')}>
            <Text
              style={applyStyles(
                'pb-8 text-center text-700 text-uppercase text-gray-300',
              )}>
              {strings('send_via')}
            </Text>
            <View style={applyStyles('center')}>
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
                          'pl-xs text-400 text-uppercase text-gray-200',
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
                        color={colors.secondary}
                      />
                      <Text
                        style={applyStyles(
                          'pl-xs text-400 text-uppercase text-gray-200',
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
                        color={colors.secondary}
                      />
                      <Text
                        style={applyStyles(
                          'pl-xs text-400 text-uppercase text-gray-200',
                        )}>
                        {strings('other')}
                      </Text>
                    </View>
                  </Touchable>
                </View>
                {user?.currency_code === 'KES' && (
                  <View style={applyStyles('px-4')}>
                    <Touchable onPress={handleDeposit}>
                      <View
                        style={applyStyles('px-2 flex-row center', {
                          height: 48,
                        })}>
                        <Icon
                          size={16}
                          type="feathericons"
                          name="dollar-sign"
                          color={colors.secondary}
                        />
                        <Text
                          style={applyStyles(
                            'pl-xs text-400 text-uppercase text-gray-200',
                          )}>
                          {strings('push_payment')}
                        </Text>
                      </View>
                    </Touchable>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        <Button
          onPress={handleDone}
          title={strings('done')}
          style={applyStyles({width: '48%'})}
        />
      </View>
    </View>
  );
});
