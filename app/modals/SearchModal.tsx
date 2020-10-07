import React from 'react';
import {View} from 'react-native';
import {BaseModalProps, ModalPropsList} from 'types/modal';
import Modal from 'react-native-modal';
import {applyStyles} from '@/helpers/utils';
import SearchableDropdown from '@/components/SearchableDropdown';

type SearchModalProps = ModalPropsList['search'] & BaseModalProps;

const SearchModal = ({visible, closeModal, ...restProps}: SearchModalProps) => {
  return (
    <Modal
      isVisible={visible}
      // onSwipeComplete={closeModal}
      onBackdropPress={closeModal}
      onBackButtonPress={closeModal}
      // swipeDirection={['down']}
      animationIn="slideInDown"
      animationOut="slideOutUp"
      style={applyStyles('justify-start m-0')}>
      <View>
        <SearchableDropdown {...restProps} />
      </View>
    </Modal>
  );
};

export default SearchModal;
