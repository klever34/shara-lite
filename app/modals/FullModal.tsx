import React from 'react';
import Modal from 'react-native-modal';
import {BaseModalProps, ModalPropsList} from 'types/modal';
import {applyStyles} from '@/helpers/utils';
import {View, StyleSheet} from 'react-native';

type FullModalProps = ModalPropsList['full'] & BaseModalProps;

const FullModal = ({visible, closeModal, renderContent}: FullModalProps) => {
  return (
    <Modal
      isVisible={visible}
      onSwipeComplete={closeModal}
      onBackdropPress={closeModal}
      onBackButtonPress={closeModal}
      swipeDirection={['down']}
      style={applyStyles('justify-end m-0')}>
      <View style={styles.content}>{renderContent({closeModal})}</View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: applyStyles('flex-1 bg-white'),
});

export default FullModal;
