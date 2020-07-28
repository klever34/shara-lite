import React, {ComponentProps, ElementType, useCallback, useState} from 'react';
import {applyStyles} from './utils';
import {ActivityIndicator, Text, View} from 'react-native';
import {colors} from '../styles';
import Modal from 'react-native-modal';

export type ModalWrapperFields = {openModal: (text: string) => () => void};

export const withModal = (Component: ElementType) => (
  props: ComponentProps<typeof Component> & ModalWrapperFields,
) => {
  const [modalText, setModalText] = useState('');
  const [modalVisible, setModalVisibility] = useState(false);
  const openModal = useCallback((text: string) => {
    setModalText(text);
    setModalVisibility(true);
    return () => {
      setModalText('');
      setModalVisibility(false);
    };
  }, []);
  return (
    <>
      <Component {...props} openModal={openModal} />
      <Modal isVisible={modalVisible} style={applyStyles('items-center')}>
        <View
          style={applyStyles('p-lg flex-row items-center', {
            borderRadius: 4,
            backgroundColor: colors.white,
          })}>
          <ActivityIndicator size={32} style={applyStyles('mr-md')} />
          <Text style={applyStyles('text-lg')}>{modalText}</Text>
        </View>
      </Modal>
    </>
  );
};
