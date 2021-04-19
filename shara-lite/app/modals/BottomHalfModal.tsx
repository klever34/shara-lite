import React, {ReactNode, useCallback} from 'react';
import Modal from 'react-native-modal';
import {BaseModalProps, ModalOptionsList} from 'types/modal';
import {View, StyleSheet} from 'react-native';
import {applyStyles} from '@/styles';

type BottomHalfModalProps = ModalOptionsList['bottom-half'] & BaseModalProps;

export const BottomHalfModalContainer = ({
  visible,
  onClose,
  children,
  swipeDirection = ['down'],
}: Pick<BottomHalfModalProps, 'visible' | 'swipeDirection'> & {
  children: ReactNode;
  onClose: () => void;
}) => {
  return (
    <Modal
      isVisible={visible}
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection={swipeDirection}
      // hideModalContentWhileAnimating={true}
      // useNativeDriver={true}
      style={applyStyles('justify-end m-0')}>
      <View style={styles.content}>
        <View
          style={applyStyles(
            'w-60 h-4 bg-gray-20 self-center rounded-8 mt-24 mb-16',
          )}
        />
        {children}
      </View>
    </Modal>
  );
};

const BottomHalfModal = ({
  visible,
  closeModal,
  renderContent,
  swipeDirection = ['down'],
  onCloseModal,
  showHandleNub = true,
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
        {showHandleNub && (
          <View
            style={applyStyles(
              'w-60 h-4 bg-gray-20 self-center rounded-8 mt-16 mb-8',
            )}
          />
        )}
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
