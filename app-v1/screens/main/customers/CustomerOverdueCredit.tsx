import Touchable from 'app-v1/components/Touchable';
import {getAuthService, getAnalyticsService} from 'app-v1/services';
import {getAllPayments} from 'app-v1/services/ReceiptService';
import {ShareHookProps, useShare} from 'app-v1/services/share';
import {useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import format from 'date-fns/format';
import orderBy from 'lodash/orderBy';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {ActionCard, ShareModal} from '../../../components';
import EmptyState from '../../../components/EmptyState';
import HeaderRight from '../../../components/HeaderRight';
import {amountWithCurrency, applyStyles} from 'app-v1/helpers/utils';
import {ICredit} from 'app-v1/models/Credit';
import {colors} from 'app-v1/styles';
import {ReceiptImage} from '../business';
import {MainStackParamList} from '../index';

export const CustomerOverdueCredit = ({
  route,
}: StackScreenProps<MainStackParamList, 'CustomerOverdueCredit'>) => {
  const navigation = useNavigation();
  const credits = route.params.credits;
  const user = getAuthService().getUser();
  const businessInfo = user?.businesses[0];

  const [receiptImage, setReceiptImage] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<ICredit | undefined>();

  const allPayments = selectedCredit?.receipt
    ? getAllPayments({receipt: selectedCredit.receipt})
    : [];
  const totalAmountPaid = allPayments.reduce(
    (total, payment) => total + payment.amount_paid,
    0,
  );
  const creditAmountLeft = selectedCredit?.receipt?.credits?.reduce(
    (acc, item) => acc + item.amount_left,
    0,
  );

  const paymentReminderMessage = `Hello, you purchased some items from ${
    businessInfo?.name
  } for ${amountWithCurrency(
    selectedCredit?.receipt?.total_amount,
  )}. You paid ${amountWithCurrency(
    totalAmountPaid,
  )} and owe ${amountWithCurrency(creditAmountLeft)} which is due on ${
    selectedCredit?.due_date
      ? format(new Date(selectedCredit?.due_date), 'MMM dd, yyyy')
      : ''
  }. Don't forget to make payment.\n\nPowered by Shara for free.\nhttp://shara.co`;

  const shareProps: ShareHookProps = {
    image: receiptImage,
    title: 'Payment Reminder',
    subject: 'Payment Reminder',
    message: paymentReminderMessage,
    recipient: selectedCredit?.customer?.mobile,
  };

  const {handleEmailShare, handleSmsShare, handleWhatsappShare} = useShare(
    shareProps,
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  const handleViewDetails = (creditDetails: ICredit) => {
    getAnalyticsService()
      .logEvent('selectContent', {
        item_id: creditDetails?._id?.toString() ?? '',
        content_type: 'credit',
      })
      .then(() => {});
    navigation.navigate('CustomerCreditDetails', {creditDetails});
  };

  const handleOpenShareModal = useCallback((credit: ICredit) => {
    setIsShareModalOpen(true);
    setSelectedCredit(credit);
  }, []);

  const renderCreditItem = ({item: creditDetails}: {item: ICredit}) => {
    const hasCustomer = creditDetails.customer?.mobile;

    return (
      <View style={styles.creditItem}>
        <ActionCard>
          <View style={applyStyles('flex-row', 'justify-space-between')}>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Customer</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {creditDetails.customer?.name}
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

          <View
            style={applyStyles('flex-row items-center justify-space-between', {
              borderTopWidth: 1,
              borderTopColor: colors['gray-20'],
            })}>
            <Touchable onPress={() => handleViewDetails(creditDetails)}>
              <View
                style={applyStyles('items-center justify-center', {
                  height: 60,
                  width: hasCustomer ? '48%' : '100%',
                })}>
                <Text
                  style={applyStyles('text-400 text-uppercase', {
                    color: colors.primary,
                  })}>
                  view details
                </Text>
              </View>
            </Touchable>
            {hasCustomer && (
              <Touchable onPress={() => handleOpenShareModal(creditDetails)}>
                <View
                  style={applyStyles('items-center justify-center', {
                    height: 60,
                    width: '48%',
                    borderLeftWidth: 1,
                    borderLeftColor: colors['gray-20'],
                  })}>
                  <Text
                    style={applyStyles('text-400 text-uppercase', {
                      color: colors.primary,
                    })}>
                    Send a reminder
                  </Text>
                </View>
              </Touchable>
            )}
          </View>
        </ActionCard>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={applyStyles('py-xl', 'flex-1', {
        backgroundColor: colors['gray-20'],
      })}>
      <FlatList
        data={orderBy(credits, 'created_by', 'desc')}
        renderItem={renderCreditItem}
        keyExtractor={(item) => `${item._id}`}
        ListEmptyComponent={
          <EmptyState
            heading="No credit"
            style={applyStyles({marginTop: 32})}
            source={require('../../../assets/images/coming-soon.png')}
          />
        }
      />
      <ShareModal
        title="Send reminder via"
        visible={isShareModalOpen}
        onSmsShare={handleSmsShare}
        onEmailShare={handleEmailShare}
        onWhatsappShare={handleWhatsappShare}
        onClose={() => setIsShareModalOpen(false)}
      />
      <View style={applyStyles({opacity: 0, height: 0})}>
        <ReceiptImage
          user={user}
          captureMode="update"
          amountPaid={totalAmountPaid}
          creditAmount={creditAmountLeft}
          tax={selectedCredit?.receipt?.tax}
          customer={selectedCredit?.customer}
          products={selectedCredit?.receipt?.items}
          getImageUri={(data) => setReceiptImage(data)}
          totalAmount={selectedCredit?.receipt?.total_amount}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  creditItem: {
    marginBottom: 12,
    marginHorizontal: 16,
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
