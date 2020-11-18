import {applyStyles} from 'app-v2/helpers/utils';
import {colors} from 'app-v2/styles';
import {useFormik} from 'formik';
import React from 'react';
import {Text, View} from 'react-native';
import Modal from 'react-native-modal';
import * as yup from 'yup';
import {Button} from '../Button';
import {FloatingLabelInput} from 'app-v2/components';

type Props = {
  isVisible: boolean;
  closeModal(): void;
  onCancelReceipt(note: string): void;
};

const validationSchema = yup.object().shape({
  note: yup.string().required('Please add a note'),
});

export const CancelReceiptModal = (props: Props) => {
  const {isVisible, closeModal, onCancelReceipt} = props;
  const {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit,
    isSubmitting,
  } = useFormik({
    validationSchema,
    initialValues: {note: ''},
    onSubmit: (payload) => onCancelReceipt(payload.note),
  });

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={closeModal}
      onBackButtonPress={closeModal}>
      <View
        style={applyStyles('p-lg', {
          backgroundColor: colors.white,
          borderRadius: 4,
        })}>
        <Text style={applyStyles('mb-xl text-500 text-center text-uppercase')}>
          Confirm cancellation
        </Text>
        <View style={applyStyles('mb-xl')}>
          <FloatingLabelInput
            multiline
            value={values.note}
            errorMessage={errors.note}
            label="Why are you cancelling?"
            onChangeText={handleChange('note')}
            isInvalid={touched.note && !!errors.note}
          />
        </View>
        <View style={applyStyles('flex-row justify-between')}>
          <View style={applyStyles({width: '48%'})}>
            <Button
              title="Confirm"
              onPress={handleSubmit}
              isLoading={isSubmitting}
            />
          </View>
          <View style={applyStyles({width: '48%'})}>
            <Button variantColor="clear" title="Close" onPress={closeModal} />
          </View>
        </View>
      </View>
    </Modal>
  );
};
