import React, {useCallback} from 'react';
import {BaseModalProps, ModalPropsList} from 'types/modal';
import Modal from 'react-native-modal';
import {applyStyles} from '@/helpers/utils';
import SearchableDropdown from '@/components/SearchableDropdown';
import {getAnalyticsService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';

type SearchModalProps = ModalPropsList['search'] & BaseModalProps;

const SearchModal = ({visible, closeModal, ...restProps}: SearchModalProps) => {
  const handleError = useErrorHandler();
  const handleBlur = useCallback(
    (query: string) => {
      if (query) {
        getAnalyticsService()
          .logEvent('search', {
            content_type: 'Receipt',
            search_term: query,
          })
          .catch(handleError);
      }
    },
    [handleError],
  );
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={closeModal}
      onBackButtonPress={closeModal}
      animationIn="slideInDown"
      animationOut="slideOutUp"
      style={applyStyles('justify-start m-0')}>
      <SearchableDropdown {...restProps} onBlur={handleBlur} />
    </Modal>
  );
};

export default SearchModal;
