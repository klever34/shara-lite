import {useNavigation} from '@react-navigation/native';
import format from 'date-fns/format';
import orderBy from 'lodash/orderBy';
import React, {useCallback, useState} from 'react';
import {Alert, FlatList, StyleSheet, Text, View} from 'react-native';
import Share from 'react-native-share';
import {FAButton} from '../../../../components';
import EmptyState from '../../../../components/EmptyState';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {
  amountWithCurrency,
  applyStyles,
  getCustomerWhatsappNumber,
} from '../../../../helpers/utils';
import {IReceipt} from '../../../../models/Receipt';
import {getAnalyticsService, getAuthService} from '../../../../services';
import {useRealm} from '../../../../services/realm';
import {getReceipts, getAllPayments} from '../../../../services/ReceiptService';
import {colors} from '../../../../styles';
import {ReceiptDetailsModal, ShareReceiptModal} from '../receipts';

type ReceiptItemProps = {
  item: IReceipt;
};

export function MyReceipts() {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const receipts = getReceipts({realm});
  const authService = getAuthService();
  const user = authService.getUser();
  const businessInfo = user?.businesses[0];
  const userCountryCode = user?.country_code;

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<IReceipt | null>(null);

  const allPayments = activeReceipt
    ? getAllPayments({receipt: activeReceipt})
    : [];
  const totalAmountPaid = allPayments.reduce(
    (total, payment) => total + payment.amount_paid,
    0,
  );
  const creditAmountLeft = activeReceipt?.credits?.reduce(
    (acc, item) => acc + item.amount_left,
    0,
  );

  const handleReceiptItemClick = useCallback((receipt) => {
    setActiveReceipt(receipt);
    getAnalyticsService()
      .logEvent('selectContent', {
        item_id: receipt?._id?.toString() ?? '',
        content_type: 'receipt',
      })
      .then(() => {});
  }, []);

  const handleCloseReceiptDetailsModal = useCallback(() => {
    setActiveReceipt(null);
  }, []);

  const handleOpenShareModal = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setIsShareModalOpen(false);
  }, []);

  const handleSmsShare = useCallback(async () => {
    // TODO: use better copy for shara invite
    const shareOptions = {
      // @ts-ignore
      social: Share.Social.SMS,
      message: `Hi ${
        activeReceipt?.customer?.name
      }, thank you for your recent purchase of ${
        activeReceipt?.items?.length
      } item(s) from ${
        user?.businesses[0].name
      }.  You paid ${amountWithCurrency(
        totalAmountPaid,
      )} and owe ${amountWithCurrency(creditAmountLeft)} ${
        activeReceipt?.credits && activeReceipt?.credits[0]?.due_date
          ? `(which is due on ${format(
              new Date(activeReceipt?.credits[0]?.due_date),
              'MMM dd, yyyy',
            )})`
          : ''
      }. Thank you.`,
      recipient: `${activeReceipt?.customer_mobile}`,
      title: `Share receipt with ${activeReceipt?.customer_name}`,
    };

    if (!activeReceipt?.customer_mobile) {
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
  }, [activeReceipt, creditAmountLeft, totalAmountPaid, user]);

  const handleEmailShare = useCallback(
    async ({receiptImage}: {receiptImage: string}, callback?: () => void) => {
      // TODO: use better copy for shara invite
      const shareOptions = {
        title: 'Share receipt',
        message: `Hi${
          activeReceipt?.customer?.name
            ? ` ${activeReceipt?.customer?.name}`
            : ''
        }, here is your receipt from ${businessInfo?.name}`,
        subject: activeReceipt?.customer?.name
          ? `${activeReceipt?.customer.name}'s Receipt`
          : 'Your Receipt',
        url: `data:image/png;base64,${receiptImage}`,
      };

      try {
        await Share.open(shareOptions);
        callback && callback();
      } catch (e) {
        Alert.alert('Error', e.error);
      }
    },
    [activeReceipt, businessInfo],
  );

  const handleWhatsappShare = useCallback(
    async (receiptImage: string) => {
      // TODO: use better copy for shara invite
      const mobile = activeReceipt?.customer?.mobile;
      const whatsAppNumber = getCustomerWhatsappNumber(mobile, userCountryCode);
      const shareOptions = {
        whatsAppNumber,
        social: Share.Social.WHATSAPP,
        url: `data:image/png;base64,${receiptImage}`,
        message: `Hi ${activeReceipt?.customer?.name}, Here is your receipt from ${businessInfo?.name}`,
        title: `Share receipt with ${activeReceipt?.customer?.name}`,
      };
      const errorMessages = {
        filename: 'Invalid file attached',
        whatsAppNumber: 'Please check the phone number supplied',
      } as {[key: string]: any};

      if (!activeReceipt?.customer?.mobile) {
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
    },
    [activeReceipt, businessInfo, userCountryCode],
  );

  const renderReceiptItem = useCallback(
    ({item: receipt}: ReceiptItemProps) => {
      return (
        <Touchable onPress={() => handleReceiptItemClick(receipt)}>
          <View
            style={applyStyles(
              'px-lg',
              'py-lg',
              'flex-row',
              'justify-space-between',
              {
                flexWrap: 'wrap',
                borderBottomWidth: 1,
                borderBottomColor: colors['gray-20'],
              },
            )}>
            <View
              style={applyStyles({
                width: '48%',
              })}>
              <Text
                style={applyStyles('pb-sm', 'text-400', {
                  fontSize: 16,
                  color: colors['gray-300'],
                })}>
                {receipt.customer?.name ? receipt.customer.name : 'No Customer'}
              </Text>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 16,
                  color: colors['gray-200'],
                })}>
                {receipt?.items?.length}{' '}
                {receipt.items && receipt.items.length > 1
                  ? 'Products'
                  : 'Product'}
              </Text>
            </View>
            <View
              style={applyStyles({
                width: '48%',
              })}>
              <Text
                style={applyStyles('pb-sm', 'text-400', {
                  fontSize: 16,
                  color: colors.primary,
                })}>
                {amountWithCurrency(receipt.total_amount)}
              </Text>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 14,
                  color: colors['gray-200'],
                })}>
                {receipt.created_at &&
                  format(receipt.created_at, 'MMM dd, yyyy hh:mm:a')}
              </Text>
            </View>
          </View>
        </Touchable>
      );
    },
    [handleReceiptItemClick],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={orderBy(receipts, 'created_at', 'desc')}
        renderItem={renderReceiptItem}
        keyExtractor={(item) => `${item._id}`}
        ListEmptyComponent={
          <EmptyState
            heading="No receipts created"
            source={require('../../../../assets/images/coming-soon.png')}
            text="Click the button below to create a new receipt"
          />
        }
      />

      <FAButton
        style={styles.fabButton}
        onPress={() => navigation.navigate('NewReceipt')}>
        <View style={styles.fabButtonContent}>
          <Icon size={18} name="plus" color="white" type="feathericons" />
          <Text style={applyStyles(styles.fabButtonText, 'text-400')}>
            Create
          </Text>
        </View>
      </FAButton>

      <ShareReceiptModal
        tax={activeReceipt?.tax}
        visible={isShareModalOpen}
        onSmsShare={handleSmsShare}
        amountPaid={totalAmountPaid}
        products={activeReceipt?.items}
        onEmailShare={handleEmailShare}
        creditAmount={creditAmountLeft}
        onClose={handleCloseShareModal}
        customer={activeReceipt?.customer}
        onWhatsappShare={handleWhatsappShare}
        totalAmount={activeReceipt?.total_amount}
        receiptId={activeReceipt?._id?.toString()}
      />

      <ReceiptDetailsModal
        receipt={activeReceipt}
        visible={!!activeReceipt}
        onOpenShareModal={handleOpenShareModal}
        onClose={handleCloseReceiptDetailsModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  card: {
    padding: 16,
    paddingTop: 16,
    elevation: 0,
  },
  cardTitle: {
    fontSize: 12,
    paddingBottom: 4,
    fontFamily: 'Rubik-Medium',
    textTransform: 'uppercase',
  },
  cardContent: {
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
  fabButton: {
    height: 48,
    width: 'auto',
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabButtonText: {
    fontSize: 16,
    paddingLeft: 8,
    color: colors.white,
    textTransform: 'uppercase',
  },
});
