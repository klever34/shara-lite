import BottomHalfModal from 'app-v3/modals/BottomHalfModal';
import {applyStyles, colors} from 'app-v3/styles';
import React, {useCallback} from 'react';
import {Text, View} from 'react-native';
import {Icon} from './Icon';
import Touchable from './Touchable';

type Props = {
  title?: string;
  onClose(): void;
  visible: boolean;
  onSmsShare?(): void;
  onEmailShare?(): void;
  onWhatsappShare?(): void;
};

export const ShareModal = ({
  title,
  onClose,
  visible,
  onSmsShare,
  onEmailShare,
  onWhatsappShare,
}: Props) => {
  const renderContent = useCallback(() => {
    return (
      <View>
        <View
          style={applyStyles('items-center', 'justify-center', 'py-lg', {
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-20'],
          })}>
          <Text
            style={applyStyles('text-500', 'text-uppercase', {
              color: colors.primary,
            })}>
            {title}
          </Text>
        </View>
        <View>
          <View>
            <Touchable onPress={onWhatsappShare}>
              <View
                style={applyStyles(
                  'flex-row',
                  'items-center',
                  'justify-center',
                  {
                    height: 60,
                    borderBottomWidth: 1,
                    borderBottomColor: colors['gray-20'],
                  },
                )}>
                <Icon
                  size={24}
                  type="ionicons"
                  name="logo-whatsapp"
                  color={colors.whatsapp}
                />
                <Text
                  style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                    color: colors['gray-200'],
                  })}>
                  whatsapp
                </Text>
              </View>
            </Touchable>
            <Touchable onPress={onSmsShare}>
              <View
                style={applyStyles(
                  'flex-row',
                  'items-center',
                  'justify-center',
                  {
                    height: 60,
                    borderBottomWidth: 1,
                    borderBottomColor: colors['gray-20'],
                  },
                )}>
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
                  sms
                </Text>
              </View>
            </Touchable>
            <Touchable onPress={onEmailShare}>
              <View
                style={applyStyles(
                  'flex-row',
                  'items-center',
                  'justify-center',
                  {
                    height: 60,
                    borderBottomWidth: 1,
                    borderBottomColor: colors['gray-20'],
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
    );
  }, [onEmailShare, onSmsShare, onWhatsappShare, title]);

  return (
    <BottomHalfModal
      visible={visible}
      closeModal={onClose}
      renderContent={renderContent}
    />
  );
};
