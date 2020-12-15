import {AppInput, Button} from '@/components';
import {applyStyles} from '@/styles';
import {useFormik} from 'formik';
import React from 'react';
import {Text, View} from 'react-native';

type Props = {
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (label: string) => void;
};

export const EditPaymetPreviewLabelModal = ({
  onClose,
  isSaving,
  onSubmit,
}: Props) => {
  const {values, handleChange, handleSubmit} = useFormik({
    onSubmit: (payload) => onSubmit(payload.label),
    initialValues: {label: 'You can pay me via'},
  });

  return (
    <View style={applyStyles('px-16')}>
      <Text
        style={applyStyles(
          'pb-4 text-center text-uppercase text-700 text-gray-300',
        )}>
        Payment preview label
      </Text>
      <Text style={applyStyles('px-4 text-center text-gray-200')}>
        The payment preview label will be. You can change it to a text that your
        customers will understand.
      </Text>
      <AppInput
        value={values.label}
        containerStyle={applyStyles('mt-24')}
        onChangeText={handleChange('label')}
        placeholder="Enter payment preview label here"
      />
      <View style={applyStyles('py-24 flex-row items-center justify-between')}>
        <Button
          title="Cancel"
          onPress={onClose}
          variantColor="transparent"
          style={applyStyles({width: '48%'})}
        />
        <Button
          title="Save"
          isLoading={isSaving}
          style={applyStyles({width: '48%'})}
          onPress={() => {
            handleSubmit();
            onClose();
          }}
        />
      </View>
    </View>
  );
};
