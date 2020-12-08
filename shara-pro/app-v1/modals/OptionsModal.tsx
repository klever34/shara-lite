import React from 'react';
import Modal from 'react-native-modal';
import {BaseModalProps, ModalPropsList} from '../../types-v1/modal';
import {applyStyles} from '../helpers/utils';
import {View, StyleSheet, Text} from 'react-native';
import Touchable from '../components/Touchable';

type OptionsModalProps = ModalPropsList['options'] & BaseModalProps;

const OptionsModal = ({visible, closeModal, options}: OptionsModalProps) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={closeModal}
      onBackButtonPress={closeModal}>
      <View style={styles.content}>
        {options.map((option) => {
          return (
            <Touchable onPress={option.onPress} key={option.text}>
              <View style={applyStyles('p-lg')}>
                <Text style={applyStyles('text-base')}>{option.text}</Text>
              </View>
            </Touchable>
          );
        })}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: applyStyles('bg-white py-sm', {
    borderRadius: 4,
  }),
});

export default OptionsModal;
