import React, {
  ComponentProps,
  ElementType,
  useCallback,
  useContext,
  useState,
} from 'react';
import LoadingModal from '../modals/LoadingModal';
import {ModalOptionsList, ModalVisibilityList} from 'types/modal';
import BottomHalfModal from '../modals/BottomHalfModal';
import OptionsModal from '../modals/OptionsModal';
import FullModal from '@/modals/FullModal';
import SearchModal from '@/modals/SearchModal';

type OpenModal = <K extends keyof ModalOptionsList>(
  modalType: K,
  modalProps: ModalOptionsList[K],
) => () => void;

export type ModalWrapperFields = {
  openModal: OpenModal;
  closeModal: () => void;
};

const defaultModalPropsList: ModalOptionsList = {
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

const ModalContext = React.createContext<Partial<ModalWrapperFields>>({});

export const useModal = () => {
  return useContext(ModalContext);
};

export const withModal = (Component: ElementType) => (
  props: ComponentProps<typeof Component> & ModalWrapperFields,
) => {
  const [modalVisibility, setModalVisibility] = useState<ModalVisibilityList>(
    defaultModalVisibility,
  );
  const [modalPropsList, setModalPropsList] = useState<ModalOptionsList>(
    defaultModalPropsList,
  );

  const closeModal = useCallback(() => {
    setModalVisibility(defaultModalVisibility);
    setModalPropsList(defaultModalPropsList);
  }, []);
  const openModal = useCallback(
    (
      modalType: keyof ModalOptionsList,
      modalProps: ModalOptionsList[typeof modalType],
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
    <ModalContext.Provider value={{openModal, closeModal}}>
      <Component {...props} openModal={openModal} closeModal={closeModal} />
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
