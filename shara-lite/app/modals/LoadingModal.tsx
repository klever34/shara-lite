import React from 'react';
import {Text} from '@/components';
import {ActivityIndicator, View} from 'react-native';
import {applyStyles, colors} from '@/styles';
import Modal from 'react-native-modal';
import {BaseModalProps, ModalOptionsList} from 'types/modal';

type LoadingModalProps = ModalOptionsList['loading'] & BaseModalProps;

const LoadingModal = ({text, visible = false}: LoadingModalProps) => {
  return (
    <Modal isVisible={visible} style={applyStyles('items-center')}>
      <View
        style={applyStyles('p-lg flex-row items-center', {
          borderRadius: 4,
          backgroundColor: colors.white,
        })}>
        <ActivityIndicator
          size={32}
          color={colors.primary}
          style={applyStyles('mr-md')}
        />
        <Text style={applyStyles('text-lg')}>{text}</Text>
      </View>
    </Modal>
  );
};

export default LoadingModal;
