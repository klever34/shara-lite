import {applyStyles, colors} from '@/styles';
import {useFormik} from 'formik';
import React, {useMemo} from 'react';
import {Text} from '@/components';
import {View} from 'react-native';
import Modal from 'react-native-modal';
import * as yup from 'yup';
import {AppInput} from '../AppInput';
import {Button} from '../Button';
// Todo: Translate
import {getI18nService} from '@/services';
const strings = getI18nService().strings;
type Props = {
  isVisible: boolean;
  closeModal(): void;
  onCancelReceipt(note: string): void;
};

export const CancelReceiptModal = (props: Props) => {
  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        note: yup.string().required('Please add a note'),
      }),
    [],
  );
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
          {strings('cancel_confirmation_text')}
        </Text>
        <View style={applyStyles('mb-xl')}>
          <AppInput
            multiline
            value={values.note}
            errorMessage={errors.note}
            label={strings('cancellation_text')}
            onChangeText={handleChange('note')}
            isInvalid={touched.note && !!errors.note}
            placeholder={strings('cancellation_placeholder')}
          />
        </View>
        <View style={applyStyles('flex-row justify-between')}>
          <View style={applyStyles({width: '48%'})}>
            <Button
              title={strings('confirm')}
              onPress={handleSubmit}
              isLoading={isSubmitting}
            />
          </View>
          <View style={applyStyles({width: '48%'})}>
            <Button
              variantColor="clear"
              title={strings('close')}
              onPress={closeModal}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
