import React from 'react';
import {Modal, View, Text, Platform} from 'react-native';
import Touchable from './Touchable';
import Icon from './Icon';
import {colors} from '@/styles';
import {applyStyles} from '@/helpers/utils';

type Props = {
  title: string;
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export const PageModal = (props: Props) => {
  const {title, visible, onClose, children} = props;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={applyStyles('flex-row px-lg items-center', {
          top: 0,
          height: 64,
          backgroundColor: colors.primary,
        })}>
        <Touchable onPress={onClose}>
          <View style={applyStyles('p-lg items-center justify-center')}>
            <Icon
              size={24}
              color={colors.white}
              type="ionicons"
              name={Platform.select({
                android: 'md-arrow-back',
                ios: 'ios-checkmark',
              })}
            />
          </View>
        </Touchable>
        <Text
          style={applyStyles('heading-500 text-capitalize', {
            fontSize: 18,
            paddingLeft: 16,
            color: colors.white,
          })}>
          {title}
        </Text>
      </View>
      {children}
    </Modal>
  );
};
