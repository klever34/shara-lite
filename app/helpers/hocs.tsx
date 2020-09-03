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
  options: {
    options: [],
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
      <OptionsModal
        visible={modalVisibility.options}
        closeModal={closeModal}
        {...modalPropsList.options}
      />
    </ModalContext.Provider>
  );
};
