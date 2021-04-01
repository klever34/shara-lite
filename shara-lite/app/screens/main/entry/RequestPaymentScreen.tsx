import {AppInput, CurrencyInput, Text, toNumber} from '@/components';
import {CustomerListItem} from '@/components/CustomerListItem';
import {Icon} from '@/components/Icon';
import {Page} from '@/components/Page';
import {TitleContainer} from '@/components/TitleContainer';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {MainStackParamList} from '@/screens/main';
import {
  getAnalyticsService,
  getApiService,
  getAuthService,
  getI18nService,
} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {ShareHookProps, useShare} from '@/services/share';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {useFormik} from 'formik';
import {parsePhoneNumber} from 'libphonenumber-js';
import React, {useCallback, useRef, useState} from 'react';
import {TextInput, View} from 'react-native';
import Config from 'react-native-config';
import {STKPushConfirmation, STKPushDeposit} from '../money/MoneyDepositScreen';

type RequestPaymentScreenProps = {
  route: RouteProp<MainStackParamList, 'RequestPayment'>;
} & ModalWrapperFields;

const strings = getI18nService().strings;

export default withModal(function RequestPaymentScreen({
  route,
  openModal,
  closeModal,
}: RequestPaymentScreenProps) {
  const {customer} = route.params;

  const navigation = useAppNavigation();
  const user = getAuthService().getUser();
  const analyticsService = getAnalyticsService();
  const businessInfo = getAuthService().getBusinessInfo();

  const [loading, setLoading] = useState(false);

  const {values, handleChange, setFieldValue} = useFormik({
    initialValues: {
      note: '',
      amount:
        customer.balance && customer.balance != undefined
          ? Math.abs(customer.balance)
          : undefined,
    },
    onSubmit: (values) => console.log(values),
  });
  const noteFieldRef = useRef<TextInput | null>(null);

  const shareReceiptMessage = `Hi ${customer.name}, ${
    businessInfo.name || user?.firstname
  } is requesting a payment of ${amountWithCurrency(values.amount)}${
    values.note ? ` for ${values.note}` : ''
  }. \n\nClick this link ${Config.WEB_BASE_URL}/pay/${
    businessInfo.slug
  }?amount=${values.amount}&mobile=${customer.mobile
    ?.replace('+', '')
    .replace(/\s/g, '')}&note=${values.note}\nto make payment.\n\n${strings(
    'powered_by_shara',
  )}`;

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
    async ({mobile, amount}) => {
      try {
        setLoading(true);
        await getApiService().stkPushDeposit({
          mobile,
          amount: toNumber(amount),
        });
        getAnalyticsService()
          .logEvent('initiateDepositSTKPush', {
            amount: toNumber(amount),
          })
          .then();
        setLoading(false);
        openModal('bottom-half', {
          renderContent: () => (
            <STKPushConfirmation
              mobile={customer?.mobile ?? ''}
              onClose={handleCloseSTKPushConfirmation}
            />
          ),
        });
      } catch (error) {
        setLoading(false);
        handleError(error);
      }
    },
    [openModal, closeModal],
  );

  const handleDeposit = useCallback(() => {
    openModal('bottom-half', {
      renderContent: () => (
        <STKPushDeposit
          isLoading={loading}
          onSubmit={handleSTKPush}
          onClose={closeModal}
          initialValues={{
            amount: values?.amount?.toString() ?? '',
            mobile: nationalNumber ?? '',
          }}
        />
      ),
    });
  }, [values, nationalNumber, closeModal, openModal]);

  return (
    <Page header={{iconLeft: {}, title: ' '}}>
      <TitleContainer
        containerStyle={applyStyles('mb-8')}
        title={strings('request_payment.header.title')}
        description={strings('request_payment.header.description')}
      />
      <CustomerListItem
        customer={customer}
        containerStyle={applyStyles('py-16 mb-24')}
      />
      <CurrencyInput
        placeholder="0.00"
        value={values.amount}
        keyboardType="number-pad"
        label={strings('request_payment.fields.amount.label')}
        containerStyle={applyStyles('mb-16')}
        onChangeText={(text) => {
          const value = toNumber(text);
          setFieldValue('amount', value);
        }}
        autoFocus
      />
      <View style={applyStyles('py-12')}>
        <AppInput
          multiline
          ref={noteFieldRef}
          value={values.note}
          onChangeText={handleChange('note')}
          label={strings('request_payment.fields.note.label')}
          style={applyStyles({height: 80, textAlignVertical: 'top'})}
          placeholder={strings('request_payment.fields.note.placeholder')}
        />
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
    </Page>
  );
});
