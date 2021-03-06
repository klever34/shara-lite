import React, {useCallback, useState} from 'react';
import {Modal, Text, View} from 'react-native';
import {Button} from '../../../../components';
import Icon from '../../../../components/Icon';
import {applyStyles} from '../../../../helpers/utils';
import {ICustomer} from '../../../../models';
import {IReceiptItem} from '../../../../models/ReceiptItem';
import {getAnalyticsService, getAuthService} from '../../../../services';
import {colors} from '../../../../styles';
import {ReceiptImage} from './ReceiptImage';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSmsShare?: () => void;
  tax?: number;
  receiptId?: string;
  amountPaid?: number;
  customer?: ICustomer;
  totalAmount?: number;
  creditAmount?: number;
  products?: IReceiptItem[];
  onWhatsappShare?: (receiptImage: string) => void;
  onEmailShare?: (
    {receiptImage}: {receiptImage: string},
    callback?: () => void,
  ) => void;
};

export const ShareReceiptModal = ({
  tax,
  visible,
  onClose,
  customer,
  products,
  receiptId,
  amountPaid,
  onSmsShare,
  totalAmount,
  creditAmount,
  onEmailShare,
  onWhatsappShare,
}: Props) => {
  const authService = getAuthService();
  const user = authService.getUser();
  const analyticsService = getAnalyticsService();
  const [receiptImage, setReceiptImage] = useState('');

  const handleSmsShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'sms',
        item_id: receiptId ?? '',
        content_type: 'receipt',
      })
      .then(() => {});
    onSmsShare && onSmsShare();
  }, [receiptId, analyticsService, onSmsShare]);

  const handleEmailShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'email',
        content_type: 'receipt',
        item_id: receiptId ?? '',
      })
      .then(() => {});
    onEmailShare && onEmailShare({receiptImage});
  }, [receiptId, onEmailShare, receiptImage, analyticsService]);

  const handleWhatsappShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'whatsapp',
        content_type: 'receipt',
        item_id: receiptId ?? '',
      })
      .then(() => {});
    onWhatsappShare && onWhatsappShare(receiptImage);
  }, [receiptId, analyticsService, onWhatsappShare, receiptImage]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      onDismiss={onClose}
      animationType="slide"
      onRequestClose={onClose}>
      <View
        style={applyStyles(
          'px-lg',
          'flex-1',
          'items-center',
          'justify-center',
        )}>
        <Text
          style={applyStyles('text-400', 'pb-md', 'text-center', {
            fontSize: 18,
            color: colors.primary,
          })}>
          Select a sharing option
        </Text>

        <Button
          variantColor="white"
          style={applyStyles('w-full', 'mb-md')}
          onPress={handleEmailShare}>
          <View
            style={applyStyles('flex-row', 'items-center', 'justify-center')}>
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
              Share via email
            </Text>
          </View>
        </Button>

        <Button
          variantColor="white"
          style={applyStyles('w-full', 'mb-xl')}
          onPress={handleSmsShare}>
          <View
            style={applyStyles('flex-row', 'items-center', 'justify-center')}>
            <Icon
              size={24}
              name="message-circle"
              type="feathericons"
              color={colors.primary}
            />
            <Text
              style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                color: colors['gray-200'],
              })}>
              Share via sms
            </Text>
          </View>
        </Button>
        <View
          style={applyStyles('pt-xl', 'w-full', {
            borderTopWidth: 1,
            borderTopColor: colors['gray-20'],
          })}>
          <Button
            variantColor="white"
            style={applyStyles('w-full', 'mb-md', {
              backgroundColor: '#1BA058',
            })}
            onPress={handleWhatsappShare}>
            <View
              style={applyStyles('flex-row', 'items-center', 'justify-center')}>
              <Icon
                size={24}
                type="ionicons"
                name="logo-whatsapp"
                color={colors.white}
              />
              <Text
                style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                  color: colors.white,
                })}>
                Share via whatsapp
              </Text>
            </View>
          </Button>
        </View>
      </View>

      <View style={applyStyles('px-lg')}>
        <Button
          variantColor="clear"
          style={applyStyles({width: '100%'})}
          onPress={onClose}>
          <Text
            style={applyStyles('text-400', 'text-uppercase', {
              color: colors['gray-200'],
            })}>
            Cancel
          </Text>
        </Button>
      </View>
      <View style={applyStyles({opacity: 0, height: 0})}>
        <ReceiptImage
          tax={tax}
          user={user}
          products={products}
          customer={customer}
          amountPaid={amountPaid}
          totalAmount={totalAmount}
          creditAmount={creditAmount}
          getImageUri={(data) => setReceiptImage(data)}
        />
      </View>
    </Modal>
  );
};
