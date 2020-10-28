import {applyStyles} from 'app-v3/helpers/utils';
import {colors} from 'app-v3/styles';
import React from 'react';
import {Modal, Text, View} from 'react-native';
import Icon from './Icon';
import Touchable from './Touchable';

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
        style={applyStyles(
          'pt-32 px-sm flex-row items-center justify-between',
        )}>
        <Text
          style={applyStyles('text-500 text-uppercase', {
            fontSize: 18,
            paddingLeft: 16,
            color: colors['gray-200'],
          })}>
          {title}
        </Text>
        <Touchable onPress={onClose}>
          <View style={applyStyles('p-lg items-center justify-center')}>
            <Icon name="x" size={24} type="feathericons" />
          </View>
        </Touchable>
      </View>
      {children}
    </Modal>
  );
};
