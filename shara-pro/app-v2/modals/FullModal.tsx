import React, {useCallback} from 'react';
import Modal from 'react-native-modal';
import {ModalOptionsList, BaseModalProps} from 'types-v2/modal';
import {applyStyles} from 'app-v2/helpers/utils';
import {View, StyleSheet} from 'react-native';

type FullModalProps = ModalOptionsList['full'] & BaseModalProps;

const FullModal = ({
  visible,
  closeModal,
  renderContent,
  onCloseModal,
}: FullModalProps) => {
  const handleCloseModal = useCallback(() => {
    closeModal();
    onCloseModal?.();
  }, [closeModal, onCloseModal]);
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleCloseModal}
      onBackButtonPress={handleCloseModal}
      style={applyStyles('justify-end m-0')}>
      <View style={styles.content}>
        {renderContent({closeModal: handleCloseModal})}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: applyStyles('flex-1 bg-white'),
});

export default FullModal;
