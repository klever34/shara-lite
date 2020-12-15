import {AppInput, Button} from '@/components';
import {ToastContext} from '@/components/Toast';
import {getAnalyticsService, getApiService, getAuthService} from '@/services';
import {applyStyles} from '@/styles';
import {useFormik} from 'formik';
import React, {useCallback, useContext, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {Business} from 'types/app';
import * as yup from 'yup';

type Props = {
  onClose: () => void;
  business: Business;
  onUpdateBusiness: (business: Business) => void;
};

export const EditPaymetPreviewLabelModal = ({
  onClose,
  business,
  onUpdateBusiness,
}: Props) => {
  const [isSaving, setIsSaving] = useState(false);
  const {showSuccessToast} = useContext(ToastContext);

  const handleSavePreviewLabel = useCallback(
    async (label) => {
      try {
        const payload = new FormData();
        payload.append('payment_label', label);
        setIsSaving(true);
        await getApiService().businessSetupUpdate(payload, business.id);
        setIsSaving(false);
        getAnalyticsService()
          .logEvent('paymentPreviewLabelEdited', {})
          .then(() => {});
        showSuccessToast('Payment Label updated');
        onUpdateBusiness(getAuthService().getBusinessInfo());
        onClose();
      } catch (error) {
        setIsSaving(false);
        Alert.alert('Error', error.message);
      }
    },
    [onClose, business.id, onUpdateBusiness, showSuccessToast],
  );
  const {values, handleChange, handleSubmit} = useFormik({
    onSubmit: (payload) => handleSavePreviewLabel(payload.label),
    validationSchema: yup.object().shape({
      label: yup
        .string()
        .max(150, 'Payment label cannot be more than 150 characters long'),
    }),
    initialValues: {
      label: business.payment_label || 'You can pay me via',
    },
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
          onPress={handleSubmit}
          style={applyStyles({width: '48%'})}
        />
      </View>
    </View>
  );
};
