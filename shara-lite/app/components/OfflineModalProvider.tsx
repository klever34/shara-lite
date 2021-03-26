import React, {useState, createContext, useContext, useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';

type OfflineModalContextValue = {
  isConnected: boolean;
} & Pick<ModalWrapperFields, 'closeModal' | 'openModal'>;

const defaultValue: OfflineModalContextValue = {
  isConnected: false,
  closeModal: () => {},
  openModal: () => () => {},
};

export const OfflineModalContext = createContext<OfflineModalContextValue>(
  defaultValue,
);

export const useOfflineModal = (): OfflineModalContextValue => {
  return useContext(OfflineModalContext);
};

const OfflineModalProvider = withModal(
  (props: ModalWrapperFields & {children: React.ReactNode}) => {
    const {children, openModal, closeModal} = props;
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
      const unsubscribe = NetInfo.addEventListener((state) => {
        setIsConnected(state.isConnected);
      });

      unsubscribe();
    }, []);

    return (
      <OfflineModalContext.Provider
        value={{openModal, closeModal, isConnected}}>
        {children}
      </OfflineModalContext.Provider>
    );
  },
);

export default OfflineModalProvider;
