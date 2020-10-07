import React, {
  ComponentProps,
  ElementType,
  useCallback,
  useContext,
  useState,
} from 'react';
import LoadingModal from '../modals/LoadingModal';
import {ModalPropsList, ModalVisibilityList} from 'types/modal';
import BottomHalfModal from '../modals/BottomHalfModal';
import OptionsModal from '../modals/OptionsModal';
import FullModal from '@/modals/FullModal';
import SearchModal from '@/modals/SearchModal';

type OpenModal = <K extends keyof ModalPropsList>(
  modalType: K,
  modalProps: ModalPropsList[K],
) => () => void;

export type ModalWrapperFields = {
  openModal: OpenModal;
};

const defaultModalPropsList: ModalPropsList = {
  loading: {text: ''},
  'bottom-half': {
    renderContent: () => null,
  },
  full: {
    renderContent: () => null,
  },
  options: {
    options: [],
  },
  search: {
    items: [],
    renderItem: () => null,
    setFilter: () => false,
  },
};

const defaultModalVisibility = Object.keys(defaultModalPropsList).reduce(
  (acc, curr) => {
    return {
      ...acc,
      [curr]: false,
    };
  },
  {},
) as ModalVisibilityList;

const ModalContext = React.createContext<{openModal?: OpenModal}>({});

export const useModal = () => {
  return useContext(ModalContext);
};

export const withModal = (Component: ElementType) => (
  props: ComponentProps<typeof Component> & ModalWrapperFields,
) => {
  const [modalVisibility, setModalVisibility] = useState<ModalVisibilityList>(
    defaultModalVisibility,
  );
  const [modalPropsList, setModalPropsList] = useState<ModalPropsList>(
    defaultModalPropsList,
  );

  const closeModal = useCallback(() => {
    setModalVisibility(defaultModalVisibility);
    setModalPropsList(defaultModalPropsList);
  }, []);
  const openModal = useCallback(
    (
      modalType: keyof ModalPropsList,
      modalProps: ModalPropsList[typeof modalType],
    ) => {
      setModalPropsList((prevModalPropsList) => {
        return {
          ...prevModalPropsList,
          [modalType]: modalProps,
        };
      });
      setModalVisibility((prevModalVisibility) => {
        return {
          ...prevModalVisibility,
          [modalType]: true,
        };
      });
      return closeModal;
    },
    [closeModal],
  );
  return (
    <ModalContext.Provider value={{openModal}}>
      <Component {...props} openModal={openModal} />
      <LoadingModal
        visible={modalVisibility.loading}
        closeModal={closeModal}
        {...modalPropsList.loading}
      />
      <BottomHalfModal
        visible={modalVisibility['bottom-half']}
        closeModal={closeModal}
        {...modalPropsList['bottom-half']}
      />
      <FullModal
        visible={modalVisibility.full}
        closeModal={closeModal}
        {...modalPropsList.full}
      />
      <OptionsModal
        visible={modalVisibility.options}
        closeModal={closeModal}
        {...modalPropsList.options}
      />
      <SearchModal
        visible={modalVisibility.search}
        closeModal={closeModal}
        {...modalPropsList.search}
      />
    </ModalContext.Provider>
  );
};
