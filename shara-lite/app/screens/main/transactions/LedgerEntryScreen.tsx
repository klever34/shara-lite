import {Button} from '@/components';
import {HeaderBackButton} from '@/components/HeaderBackButton';
import {Icon} from '@/components/Icon';
import PlaceholderImage from '@/components/PlaceholderImage';
import {ReceiptImage} from '@/components/ReceiptImage';
import {ToastContext} from '@/components/Toast';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {getAnalyticsService, getAuthService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {ShareHookProps, useShare} from '@/services/share';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {format, isToday} from 'date-fns';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {SafeAreaView, Text, View} from 'react-native';
import Config from 'react-native-config';
import {MainStackParamList} from '..';

type LedgerEntryScreenProps = {
  route: RouteProp<MainStackParamList, 'LedgerEntry'>;
} & ModalWrapperFields;

export const LedgerEntryScreen = withModal((props: LedgerEntryScreenProps) => {
  const {route, openModal} = props;
  const {transaction: transactionProp} = route.params;

  const [transaction, setTransaction] = useState(transactionProp);
  const {
    _id,
    note,
    dueDate,
    amount_paid,
    total_amount,
    credit_amount,
    transaction_date,
    customer: customerProp,
  } = transaction;

  const navigation = useAppNavigation();
  const {showSuccessToast} = useContext(ToastContext);
  const {
    getTransaction,
    deleteTransaction,
    addCustomerToTransaction,
  } = useTransaction();

  const analyticsService = getAnalyticsService();
  const user = getAuthService().getUser();
  const businessInfo = getAuthService().getBusinessInfo();

  const [receiptImage, setReceiptImage] = useState('');
  const [customer, setCustomer] = useState(customerProp);

  const paymentLink =
    businessInfo.slug && `${Config.WEB_BASE_URL}/pay/${businessInfo.slug}`;
  const shareReceiptMessage = `Hi ${
    customer?.name ?? ''
  }, thank you for your recent purchase ${
    businessInfo.name || user?.firstname
      ? `from ${businessInfo.name ?? user?.firstname}`
      : ''
  }. You paid ${amountWithCurrency(amount_paid)}${
    credit_amount
      ? ` and you owe ${amountWithCurrency(credit_amount)}
         ${
           dueDate
             ? ` which is due on ${format(new Date(dueDate), 'MMM dd, yyyy')}`
             : ''
         }
         ${paymentLink ? `\n\nTo pay click\n${paymentLink}` : ''}`
      : '.'
  }\n\nPowered by Shara for free.\nwww.shara.co`;

  const shareProps: ShareHookProps = {
    image: receiptImage,
    title: 'Share Receipt',
    subject: 'Share Receipt',
    message: shareReceiptMessage,
    recipient: customer?.mobile,
  };

  const {handleSmsShare, handleEmailShare, handleWhatsappShare} = useShare(
    shareProps,
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
        item_id: transaction?._id?.toString() ?? '',
        content_type: 'share-receipt',
      })
      .then(() => {});
    handleWhatsappShare();
  }, [analyticsService, handleWhatsappShare, transaction]);

  const onOthersShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'others',
        item_id: transaction?._id?.toString() ?? '',
        content_type: 'share-receipt',
      })
      .then(() => {});
    handleEmailShare();
  }, [analyticsService, transaction, handleEmailShare]);

  const handleDeleteTransaction = useCallback(
    async (callback: () => void) => {
      try {
        await deleteTransaction({transaction});
        showSuccessToast('TRANSACTION DELETED');
        callback();
        navigation.goBack();
      } catch (error) {
        handleError(error);
      }
    },
    [navigation, transaction, deleteTransaction, showSuccessToast],
  );

  const handleAddCustomer = useCallback(
    async (selectedCustomer) => {
      try {
        setCustomer(selectedCustomer);
        await addCustomerToTransaction({
          customer: selectedCustomer,
          transaction: transaction,
        });
        navigation.goBack();
      } catch (error) {
        handleError(error);
      }
    },
    [navigation, transaction, addCustomerToTransaction],
  );

  const handleOpenConfirmModal = useCallback(() => {
    const closeModal = openModal('bottom-half', {
      renderContent: () => (
        <View style={applyStyles('px-16 pb-16')}>
          <Text
            style={applyStyles(
              'text-700 text-lg text-gray-300 text-center py-24',
            )}>
            Are you sure you want to delete this transaction?
          </Text>
          <View
            style={applyStyles('pt-16 flex-row items-center justify-between')}>
            <Button
              title="Yes, Delete"
              variantColor="transparent"
              style={applyStyles({width: '48%'})}
              onPress={() => handleDeleteTransaction(closeModal)}
            />
            <Button
              title="Cancel"
              onPress={closeModal}
              style={applyStyles({width: '48%'})}
            />
          </View>
        </View>
      ),
    });
  }, [openModal, handleDeleteTransaction]);

  const handleEditTransaction = useCallback(() => {
    navigation.navigate('EditTransaction', {transaction});
  }, [navigation, transaction]);

  const handleOpenSelectCustomerScreen = useCallback(() => {
    navigation.navigate('SelectCustomerList', {
      withCustomer: true,
      onSelectCustomer: handleAddCustomer,
    });
  }, [navigation, handleAddCustomer]);

  const handleOpenCustomerScreen = useCallback(() => {
    navigation.navigate('CustomerDetails', {customer});
  }, [navigation, customer]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const thisTransaction =
        transactionProp?._id && getTransaction(transactionProp?._id);
      thisTransaction && setTransaction(thisTransaction);
    });
  }, [navigation, transactionProp, getTransaction]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <View
        style={applyStyles(
          'flex-row py-8 pr-16 bg-white items-center justify-between',
          {
            borderBottomWidth: 1.5,
            borderBottomColor: colors['gray-20'],
          },
        )}>
        <HeaderBackButton iconName="arrow-left" />
        <View style={applyStyles('items-end')}>
          {customer ? (
            <Touchable onPress={handleOpenCustomerScreen}>
              <View style={applyStyles('flex-row items-center')}>
                <Text style={applyStyles('text-400 text-black text-base')}>
                  {customer?.name}
                </Text>
                <PlaceholderImage
                  style={applyStyles('ml-4')}
                  text={customer?.name ?? ''}
                />
              </View>
            </Touchable>
          ) : (
            <Touchable onPress={handleOpenSelectCustomerScreen}>
              <View style={applyStyles('flex-row items-center')}>
                <Text
                  style={applyStyles(
                    'text-400 text-red-200 text-uppercase text-base pr-4',
                  )}>
                  Add Customer
                </Text>
                <View
                  style={applyStyles('center bg-red-50', {
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                  })}>
                  <Icon
                    size={16}
                    name="plus"
                    type="feathericons"
                    color={colors['red-200']}
                  />
                </View>
              </View>
            </Touchable>
          )}
        </View>
      </View>
      <View
        style={applyStyles('flex-row items-center bg-white px-16 py-24', {
          borderBottomWidth: 1.5,
          borderBottomColor: colors['gray-20'],
        })}>
        <View style={applyStyles({width: '33%'})}>
          <Text
            style={applyStyles(
              'pb-4 text-xxs text-700 text-gray-200 text-uppercase',
            )}>
            Total
          </Text>
          <Text style={applyStyles('text-700 text-black text-base')}>
            {amountWithCurrency(total_amount)}
          </Text>
        </View>
        <View style={applyStyles('items-end', {width: '33%'})}>
          <Text
            style={applyStyles(
              'pb-4 text-xxs text-700 text-gray-200 text-uppercase',
            )}>
            Collected
          </Text>
          <Text style={applyStyles('text-700 text-gray-300 text-base')}>
            {amountWithCurrency(amount_paid)}
          </Text>
        </View>
        <View style={applyStyles('items-end', {width: '33%'})}>
          <Text
            style={applyStyles(
              'pb-4 text-xxs text-700 text-gray-200 text-uppercase',
            )}>
            Outstanding
          </Text>
          <Text style={applyStyles('text-700 text-red-100 text-base')}>
            {amountWithCurrency(credit_amount)}
          </Text>
        </View>
      </View>
      <View style={applyStyles('px-16 flex-1')}>
        {transaction.dueDate && isToday(transaction.dueDate) && (
          <View style={applyStyles('pt-16 center')}>
            <View
              style={applyStyles('bg-red-200 p-8 flex-row items-center', {
                borderRadius: 8,
              })}>
              <Icon
                size={16}
                name="calendar"
                type="feathericons"
                color={colors['red-50']}
              />
              <Text
                style={applyStyles('pl-4 text-white text-400 text-uppercase')}>
                Collection due today
              </Text>
            </View>
          </View>
        )}
        {!!transaction.note && (
          <View style={applyStyles('pt-16')}>
            <Text
              style={applyStyles(
                'pb-4 text-xxs text-700 text-gray-300 text-uppercase',
              )}>
              Notes
            </Text>
            <Text style={applyStyles('text-400 text-gray-300 text-base')}>
              {transaction.note}
            </Text>
          </View>
        )}
        <View style={applyStyles('pt-16')}>
          {transaction.transaction_date && (
            <Text
              style={applyStyles(
                'text-400 text-gray-100 text-xs text-uppercase',
              )}>
              {format(transaction.transaction_date, 'dd MMM, yyyy')}
            </Text>
          )}
          <View style={applyStyles('flex-row items-center flex-wrap pt-4')}>
            <Text
              style={applyStyles(
                'text-sm text-uppercase text-gray-300 text-700',
              )}>
              Share:
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
                    other
                  </Text>
                </View>
              </Touchable>
            </View>
          </View>
        </View>
      </View>
      <View style={applyStyles('p-16 flex-row items-center justify-between')}>
        <Button
          title="Delete"
          variantColor="transparent"
          onPress={handleOpenConfirmModal}
          style={applyStyles({width: '48%'})}
        />
        <Button
          title="Edit"
          variantColor="clear"
          onPress={handleEditTransaction}
          style={applyStyles({width: '48%'})}
        />
      </View>
      <View style={applyStyles({opacity: 0, height: 0})}>
        <ReceiptImage
          note={note}
          customer={customer}
          creditDueDate={dueDate}
          amountPaid={amount_paid}
          totalAmount={total_amount}
          creditAmount={credit_amount}
          createdAt={transaction_date}
          receiptNo={_id?.toString().substring(0, 6)}
          getImageUri={(data) => setReceiptImage(data)}
        />
      </View>
    </SafeAreaView>
  );
});
