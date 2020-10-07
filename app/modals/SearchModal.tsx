import React from 'react';
import {BaseModalProps, ModalPropsList} from 'types/modal';
import Modal from 'react-native-modal';
import {applyStyles} from '@/helpers/utils';
import SearchableDropdown from '@/components/SearchableDropdown';

type SearchModalProps = ModalPropsList['search'] & BaseModalProps;

const SearchModal = ({visible, closeModal, ...restProps}: SearchModalProps) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={closeModal}
      onBackButtonPress={closeModal}
      animationIn="slideInDown"
      animationOut="slideOutUp"
      style={applyStyles('justify-start m-0')}>
      <SearchableDropdown {...restProps} />
    </Modal>
  );
};

export default SearchModal;
