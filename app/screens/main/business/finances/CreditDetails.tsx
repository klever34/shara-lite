import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import Share from 'react-native-share';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {ContactsListModal, CreditPaymentForm} from '@/components';
import HeaderRight from '@/components/HeaderRight';
import Icon from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {
  amountWithCurrency,
  applyStyles,
  getCustomerWhatsappNumber,
} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {ICredit} from '@/models/Credit';
import {IReceipt} from '@/models/Receipt';
import {useScreenRecord} from '@/services/analytics';
import {saveCreditPayment} from '@/services/CreditPaymentService';
import {useRealm} from '@/services/realm';
import {getAllPayments, updateReceipt} from '@/services/ReceiptService';
import {colors} from '@/styles';
import {CustomersList, ReceiptImage} from '../receipts';
import {getAuthService} from '@/services';
import {getCustomers, saveCustomer} from '@/services/CustomerService';

export const CreditDetails = ({route}: any) => {
  useScreenRecord();
  const realm = useRealm();
  const authService = getAuthService();
  const user = authService.getUser();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState('');
  const [customer, setCustomer] = useState<ICustomer>({} as ICustomer);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);
  const [isCustomersListModalOpen, setIsCustomersListModalOpen] = useState(
    false,
  );

  const {creditDetails}: {creditDetails: ICredit} = route.params;
  const customers = getCustomers({realm});
  const businessInfo = user?.businesses[0];
  const userCountryCode = user?.country_code;
  const allPayments = creditDetails.receipt
    ? getAllPayments({receipt: creditDetails.receipt})
    : [];
  const totalAmountPaid = allPayments.reduce(
    (total, payment) => total + payment.amount_paid,
    0,
  );
  const creditAmountLeft = creditDetails?.receipt?.credits?.reduce(
    (acc, item) => acc + item.amount_left,
    0,
  );
  const paymentReminderMessage = `Hello, you purchased some items from ${
    businessInfo?.name
  } for ${amountWithCurrency(
    creditDetails.receipt?.total_amount,
  )}. You paid ${amountWithCurrency(
    totalAmountPaid,
  )} and owe ${amountWithCurrency(creditAmountLeft)} which is due on ${
    creditDetails.due_date
      ? format(new Date(creditDetails.due_date), 'MMM dd, yyyy')
      : ''
  }. Don't forget to make payment.\n\nPowered by Shara for free.\nhttp://shara.co`;

  const handleOpenCustomersList = useCallback(() => {
    setIsCustomersListModalOpen(true);
  }, []);

  const handleCloseCustomersList = useCallback(() => {
    setIsCustomersListModalOpen(false);
  }, []);

  const handleOpenContactListModal = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setIsContactListModalOpen(false);
    handleCloseCustomersList();
  }, [handleCloseCustomersList]);

  const handleSetCustomer = useCallback((value: ICustomer) => {
    setCustomer(value);
  }, []);

  const handleCustomerSelect = useCallback(
    ({customer: customerData}) => {
      setCustomer(customerData);
    },
    [setCustomer],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  const handleSmsShare = useCallback(async () => {
    const shareOptions = {
      // @ts-ignore
      social: Share.Social.SMS,
      title: 'Payment Reminder',
      message: paymentReminderMessage,
      recipient: `${creditDetails.customer?.mobile}`,
    };

    if (!creditDetails.customer?.mobile) {
      Alert.alert(
        'Info',
        'Please select a customer to share receipt with via Whatsapp',
      );
    } else {
      try {
        await Share.shareSingle(shareOptions);
      } catch (e) {
        Alert.alert('Error', e.error);
      }
    }
  }, [creditDetails.customer, paymentReminderMessage]);

  const handleEmailShare = useCallback(async () => {
    const shareOptions = {
      title: 'Payment Reminder',
      subject: 'Payment Reminder',
      message: paymentReminderMessage,
      url: `data:image/png;base64,${receiptImage}`,
    };

    try {
      await Share.open(shareOptions);
    } catch (e) {
      console.log('Error', e.error);
    }
  }, [paymentReminderMessage, receiptImage]);

  const handleWhatsappShare = useCallback(async () => {
    const mobile = creditDetails?.customer?.mobile;
    const whatsAppNumber = getCustomerWhatsappNumber(mobile, userCountryCode);
    const shareOptions = {
      whatsAppNumber,
      title: 'Payment Reminder',
      message: paymentReminderMessage,
      social: Share.Social.WHATSAPP,
      url: `data:image/png;base64,${receiptImage}`,
    };
    const errorMessages = {
      filename: 'Invalid file attached',
      whatsAppNumber: 'Please check the phone number supplied',
    } as {[key: string]: any};

    if (!creditDetails?.customer?.mobile) {
      Alert.alert(
        'Info',
        'Please select a customer to share receipt with via Whatsapp',
      );
    } else {
      try {
        await Share.shareSingle(shareOptions);
      } catch (e) {
        Alert.alert('Error', errorMessages[e.error]);
      }
    }
  }, [creditDetails, paymentReminderMessage, receiptImage, userCountryCode]);

  const handleSubmit = useCallback(
    (payload, callback) => {
      if (creditDetails.customer?.name || customer.name) {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          const newCustomer = creditDetails.customer?.name
            ? creditDetails.customer
            : customer._id
            ? customer
            : saveCustomer({realm, customer});
          updateReceipt({
            realm,
            customer: newCustomer,
            receipt: creditDetails.receipt as IReceipt,
          });
          saveCreditPayment({
            realm,
            ...payload,
            customer: newCustomer,
          });
          callback();
          navigation.navigate('Finances', {screen: 'Credit'});
          ToastAndroid.show('Credit payment recorded', ToastAndroid.SHORT);
        }, 300);
      } else {
        Alert.alert('Info', 'Please select a customer');
      }
    },
    [realm, customer, navigation, creditDetails],
  );

  return (
    <ScrollView
      style={styles.container}
      persistentScrollbar={true}
      keyboardShouldPersistTaps="always">
      <View
        style={applyStyles('mb-xl pb-md', {
          borderBottomColor: colors['gray-20'],
          borderBottomWidth: 1,
        })}>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Customer</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {creditDetails.customer?.name || customer.name || 'No customer'}
            </Text>
          </View>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Amount</Text>
            <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
              {amountWithCurrency(creditDetails.amount_left)}
            </Text>
          </View>
        </View>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Given on</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {creditDetails.created_at
                ? format(new Date(creditDetails.created_at), 'MMM dd, yyyy')
                : ''}
            </Text>
            <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
              {creditDetails.created_at
                ? format(new Date(creditDetails.created_at), 'hh:mm:a')
                : ''}
            </Text>
          </View>
          {creditDetails.due_date && (
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Due on</Text>
              <Text
                style={applyStyles(styles.itemDataMedium, 'text-400', {
                  color: colors.primary,
                })}>
                {creditDetails.due_date
                  ? format(new Date(creditDetails.due_date), 'MMM dd, yyyy')
                  : ''}
              </Text>
              <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
                {creditDetails.due_date
                  ? format(new Date(creditDetails.due_date), 'hh:mm:a')
                  : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
      {!!creditDetails.customer?.name && (
        <View
          style={applyStyles('pb-xl mb-xl', {
            borderBottomColor: colors['gray-20'],
            borderBottomWidth: 1,
          })}>
          <View>
            <Text
              style={applyStyles('text-400 mb-lg', {
                fontSize: 18,
                color: colors.primary,
              })}>
              Send Reminder
            </Text>
          </View>
          <View
            style={applyStyles('flex-row items-center justify-space-between')}>
            {creditDetails.customer.mobile && (
              <View style={applyStyles({width: '33%'})}>
                <Touchable onPress={handleWhatsappShare}>
                  <View
                    style={applyStyles(
                      'flex-row',
                      'items-center',
                      'justify-center',
                      {
                        height: 48,
                      },
                    )}>
                    <Icon
                      size={24}
                      type="ionicons"
                      name="logo-whatsapp"
                      color={colors.whatsapp}
                    />
                    <Text
                      style={applyStyles(
                        'pl-sm',
                        'text-400',
                        'text-uppercase',
                        {
                          color: colors['gray-200'],
                        },
                      )}>
                      whatsapp
                    </Text>
                  </View>
                </Touchable>
              </View>
            )}
            {creditDetails.customer.mobile && (
              <View style={applyStyles({width: '33%'})}>
                <Touchable onPress={handleSmsShare}>
                  <View
                    style={applyStyles(
                      'flex-row',
                      'items-center',
                      'justify-center',
                      {
                        height: 48,
                      },
                    )}>
                    <Icon
                      size={24}
                      name="message-circle"
                      type="feathericons"
                      color={colors.primary}
                    />
                    <Text
                      style={applyStyles(
                        'pl-sm',
                        'text-400',
                        'text-uppercase',
                        {
                          color: colors['gray-200'],
                        },
                      )}>
                      sms
                    </Text>
                  </View>
                </Touchable>
              </View>
            )}
            <View style={applyStyles({width: '33%'})}>
              <Touchable onPress={handleEmailShare}>
                <View
                  style={applyStyles(
                    'flex-row',
                    'items-center',
                    'justify-center',
                    {
                      height: 48,
                    },
                  )}>
                  <Icon
                    size={24}
                    name="mail"
                    type="feathericons"
                    color={colors.primary}
                  />
                  <Text
                    style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                      color: colors['gray-200'],
                    })}>
                    email
                  </Text>
                </View>
              </Touchable>
            </View>
          </View>
        </View>
      )}
      <View>
        <Text
          style={applyStyles('text-400 mb-lg', {
            fontSize: 18,
            color: colors.primary,
          })}>
          Credit Payment
        </Text>
        <View style={applyStyles({marginBottom: 100})}>
          {!creditDetails.customer?.name && (
            <Touchable onPress={handleOpenCustomersList}>
              <View
                style={applyStyles('mb-sm flex-row py-lg items-center', {
                  borderBottomWidth: 1,
                  borderBottomColor: colors['gray-300'],
                })}>
                <Icon
                  size={25}
                  name="users"
                  type="feathericons"
                  color={colors['gray-50']}
                />
                <Text
                  style={applyStyles('pl-md text-400', {
                    fontSize: 18,
                    color: colors['gray-50'],
                  })}>
                  {customer.name ? 'Change customer' : 'Select customer'}
                </Text>
              </View>
            </Touchable>
          )}
          <CreditPaymentForm isLoading={isLoading} onSubmit={handleSubmit} />
        </View>
      </View>
      <Modal
        animationType="slide"
        visible={isCustomersListModalOpen}
        onDismiss={handleCloseCustomersList}
        onRequestClose={handleCloseCustomersList}>
        <CustomersList
          customers={customers}
          onModalClose={handleCloseCustomersList}
          onCustomerSelect={handleCustomerSelect}
          onOpenContactList={handleOpenContactListModal}
        />
      </Modal>
      <ContactsListModal<ICustomer>
        createdData={customers}
        visible={isContactListModalOpen}
        onClose={handleCloseContactListModal}
        onContactSelect={({givenName, familyName, phoneNumbers}) =>
          handleSetCustomer({
            name: `${givenName} ${familyName}`,
            mobile: phoneNumbers[0].number,
          })
        }
      />
      <View style={applyStyles({opacity: 0, height: 0})}>
        <ReceiptImage
          user={user}
          amountPaid={totalAmountPaid}
          creditAmount={creditAmountLeft}
          tax={creditDetails.receipt?.tax}
          customer={creditDetails.customer}
          products={creditDetails.receipt?.items}
          getImageUri={(data) => setReceiptImage(data)}
          totalAmount={creditDetails.receipt?.total_amount}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  item: {
    paddingBottom: 24,
  },
  itemTitle: {
    paddingBottom: 2,
    color: colors['gray-200'],
    textTransform: 'uppercase',
  },
  itemDataLarge: {
    fontSize: 18,
    color: colors['gray-300'],
  },
  itemDataMedium: {
    fontSize: 16,
    color: colors['gray-300'],
  },
  itemDataSmall: {
    fontSize: 12,
    color: colors['gray-300'],
  },
});
