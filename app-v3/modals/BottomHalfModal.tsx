import React, {useCallback} from 'react';
import Modal from 'react-native-modal';
import {BaseModalProps, ModalOptionsList} from 'types/modal';
import {applyStyles} from 'app-v3/helpers/utils';
import {View, StyleSheet} from 'react-native';

type BottomHalfModalProps = ModalOptionsList['bottom-half'] & BaseModalProps;

const BottomHalfModal = ({
  visible,
  closeModal,
  renderContent,
  swipeDirection = ['down'],
  onCloseModal,
}: BottomHalfModalProps) => {
  const handleCloseModal = useCallback(() => {
    closeModal();
    onCloseModal?.();
  }, [closeModal, onCloseModal]);
  return (
    <Modal
      isVisible={visible}
      onSwipeComplete={handleCloseModal}
      onBackdropPress={handleCloseModal}
      onBackButtonPress={handleCloseModal}
      swipeDirection={swipeDirection}
      style={applyStyles('justify-end m-0')}>
      <View style={styles.content}>
        <View
          style={applyStyles('w-72 h-4 bg-gray-50 self-center rounded-8 my-6')}
        />
        {renderContent({closeModal: handleCloseModal})}
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
