import React from 'react';
import Modal from 'react-native-modal';
import {BaseModalProps, ModalPropsList} from 'types/modal';
import {applyStyles} from '@/helpers/utils';
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
      // onSwipeComplete={closeModal}
      onBackdropPress={closeModal}
      onBackButtonPress={closeModal}
      // swipeDirection={['down']}
      style={applyStyles('justify-end m-0')}>
      <View style={styles.content}>
        <View
          style={applyStyles('w-72 h-4 bg-gray-50 self-center rounded-8 my-6')}
        />
        {renderContent({closeModal})}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: applyStyles('bg-white', {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  }),
});

export default BottomHalfModal;
