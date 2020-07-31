import React, {useCallback, useState} from 'react';
import {Modal, View, Text} from 'react-native';
import {applyStyles} from '../../../../helpers/utils';
import {colors} from '../../../../styles';
import {Button, FloatingLabelInput} from '../../../../components';
import Icon from '../../../../components/Icon';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSmsShare?: () => void;
  onEmailShare?: (email: string, callback: () => void) => void;
  onWhatsappShare?: () => void;
};

export const ShareReceiptModal = ({
  visible,
  onClose,
  onSmsShare,
  onEmailShare,
  onWhatsappShare,
}: Props) => {
  const [email, setEmail] = useState('');
  const [showEmailField, setShowEmailField] = useState(false);

  const handleClearEmailField = useCallback(() => {
    setEmail('');
    setShowEmailField(false);
  }, []);

  const handleSmsShare = useCallback(() => {
    onSmsShare && onSmsShare();
  }, [onSmsShare]);

  const handleEmailShare = useCallback(() => {
    onEmailShare && onEmailShare(email, handleClearEmailField);
  }, [email, onEmailShare, handleClearEmailField]);

  const handleWhatsappShare = useCallback(() => {
    onWhatsappShare && onWhatsappShare();
  }, [onWhatsappShare]);

  const handleEmailChange = useCallback((text) => {
    setEmail(text);
  }, []);

  return (
    <Modal
      visible={visible}
      transparent={false}
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

        {!showEmailField ? (
          <Button
            variantColor="white"
            style={applyStyles('w-full', 'mb-md')}
            onPress={() => setShowEmailField(true)}>
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
        ) : (
          <View style={applyStyles('w-full')}>
            <FloatingLabelInput
              value={email}
              keyboardType="email-address"
              label="Customer email address"
              onChangeText={handleEmailChange}
              inputStyle={applyStyles('mb-md')}
            />
            <Button
              variantColor="white"
              style={applyStyles('w-full', 'mb-md')}
              onPress={handleEmailShare}>
              <View
                style={applyStyles(
                  'flex-row',
                  'items-center',
                  'justify-center',
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
                  Share via email
                </Text>
              </View>
            </Button>
          </View>
        )}
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
          style={applyStyles({width: '100%', marginBottom: 24})}
          onPress={onClose}>
          <Text
            style={applyStyles('text-400', 'text-uppercase', {
              color: colors['gray-200'],
            })}>
            Cancel
          </Text>
        </Button>
      </View>
    </Modal>
  );
};
