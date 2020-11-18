import React, {useCallback} from 'react';
import {BaseModalProps, ModalOptionsList} from 'types-v2/modal';
import Modal from 'react-native-modal';
import {applyStyles} from 'app-v2/helpers/utils';
import SearchableDropdown from 'app-v2/components/SearchableDropdown';
import {getAnalyticsService} from 'app-v2/services';
import {useErrorHandler} from 'app-v2/services/error-boundary';

type SearchModalProps = ModalOptionsList['search'] & BaseModalProps;

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
