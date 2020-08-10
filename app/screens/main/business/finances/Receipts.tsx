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
import {amountWithCurrency, applyStyles} from '../../../../helpers/utils';
import {IReceipt} from '../../../../models/Receipt';
import {getAuthService} from '../../../../services';
import {useRealm} from '../../../../services/realm';
import {getReceipts} from '../../../../services/ReceiptService';
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

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<IReceipt | null>(null);

  const handleReceiptItemClick = useCallback((receipt) => {
    setActiveReceipt(receipt);
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

  const handlePrintReceipt = useCallback(() => {
    Alert.alert(
      'Coming soon',
      'Receipt printing is coming in the next release',
    );
  }, []);

  const handleSmsShare = useCallback(async () => {
    // TODO: use better copy for shara invite
    const shareOptions = {
      url: 'https://shara.co/',
      // @ts-ignore
      social: Share.Social.SMS,
      message: 'Here is your receipt',
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
  }, [activeReceipt]);

  const handleEmailShare = useCallback(
    async (
      {email, receiptImage}: {email: string; receiptImage: string},
      callback: () => void,
    ) => {
      // TODO: use better copy for shara invite
      const shareOptions = {
        email,
        title: 'Share receipt',
        message: `Hi ${activeReceipt?.customer?.name}, here is your receipt from ${businessInfo?.name}`,
        subject: activeReceipt?.customer?.name
          ? `${activeReceipt?.customer.name}'s Receipt`
          : 'Your Receipt',
        url: `data:image/png;base64,${receiptImage}`,
      };

      try {
        await Share.open(shareOptions);
        callback();
      } catch (e) {
        Alert.alert('Error', e.error);
      }
    },
    [activeReceipt, businessInfo],
  );

  const handleWhatsappShare = useCallback(
    async (receiptImage: string) => {
      // TODO: use better copy for shara invite
      const shareOptions = {
        social: Share.Social.WHATSAPP,
        url: `data:image/png;base64,${receiptImage}`,
        whatsAppNumber: `${activeReceipt?.customer?.mobile}`,
        message: `Hi ${activeReceipt?.customer?.name}, Here is your receipt from ${businessInfo?.name}`,
        title: `Share receipt with ${activeReceipt?.customer?.name}`,
      };
      const errorMessages = {
        filename: 'Invalid file attached',
        whatsAppNumber: 'Please check the phone number supplied',
      } as {[key: string]: any};

      if (!activeReceipt?.customer_mobile) {
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
    [activeReceipt, businessInfo],
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
                borderBottomWidth: 1,
                borderBottomColor: colors['gray-20'],
              },
            )}>
            <View>
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
            <View>
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
                  format(receipt.created_at, 'MMM dd, yyyy')}
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
        keyExtractor={(item) => `${item.id}`}
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
        products={activeReceipt?.items}
        onEmailShare={handleEmailShare}
        onClose={handleCloseShareModal}
        customer={activeReceipt?.customer}
        onWhatsappShare={handleWhatsappShare}
        totalAmount={activeReceipt?.total_amount}
      />

      <ReceiptDetailsModal
        receipt={activeReceipt}
        visible={!!activeReceipt}
        onPrintReceipt={handlePrintReceipt}
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
