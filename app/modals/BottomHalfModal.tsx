import React from 'react';
import Modal from 'react-native-modal';
import {BaseModalProps, ModalPropsList} from '../../types/modal';
import {applyStyles} from '../helpers/utils';
import {View, StyleSheet} from 'react-native';

type BottomHalfModalProps = ModalPropsList['bottom-half'] & BaseModalProps;

const BottomHalfModal = ({
  visible,
  closeModal,
  renderContent,
}: BottomHalfModalProps) => {
  return (
    <Modal
      isVisible={visible}
      onSwipeComplete={closeModal}
      onBackdropPress={closeModal}
      onBackButtonPress={closeModal}
      swipeDirection={['up', 'left', 'right', 'down']}
      style={applyStyles('justify-end m-0')}>
      <View style={styles.content}>{renderContent({closeModal})}</View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: applyStyles('bg-white', {
    borderRadius: 4,
  }),
});

export default BottomHalfModal;
