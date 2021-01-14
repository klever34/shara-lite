import {AppInput, Button} from '@/components';
import {ToastContext} from '@/components/Toast';
import {getAnalyticsService, getApiService, getAuthService} from '@/services';
import {applyStyles} from '@/styles';
import {useFormik} from 'formik';
import React, {useCallback, useContext, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {Business} from 'types/app';
import * as yup from 'yup';
import {getI18nService} from '@/services';
const strings = getI18nService().strings;

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
        showSuccessToast(
          strings(
            'payment.edit_payment_preview_label_modal.payment_label_updated',
          ),
        );
        onUpdateBusiness(getAuthService().getBusinessInfo());
        onClose();
      } catch (error) {
        setIsSaving(false);
        Alert.alert(strings('payment.error'), error.message);
      }
    },
    [onClose, business.id, onUpdateBusiness, showSuccessToast],
  );
  const {values, handleChange, handleSubmit} = useFormik({
    onSubmit: (payload) => handleSavePreviewLabel(payload.label),
    validationSchema: yup.object().shape({
      label: yup
        .string()
        .max(
          150,
          strings(
            'payment.edit_payment_preview_label_modal.validation_message',
          ),
        ),
    }),
    initialValues: {
      label:
        business.payment_label ||
        strings('payment.edit_payment_preview_label_modal.you_can_pay_me_via'),
    },
  });

  return (
    <View style={applyStyles('px-16')}>
      <Text
        style={applyStyles(
          'pb-4 text-center text-uppercase text-700 text-gray-300',
        )}>
        {strings('payment.edit_payment_preview_label_modal.title')}
      </Text>
      <Text style={applyStyles('px-4 text-center text-gray-200')}>
        {strings('payment.edit_payment_preview_label_modal.description')}
      </Text>
      <AppInput
        value={values.label}
        containerStyle={applyStyles('mt-24')}
        onChangeText={handleChange('label')}
        placeholder="Enter payment preview label here"
      />
      <View style={applyStyles('py-24 flex-row items-center justify-between')}>
        <Button
          title={strings('cancel')}
          onPress={onClose}
          variantColor="transparent"
          style={applyStyles({width: '48%'})}
        />
        <Button
          title={strings('save')}
          isLoading={isSaving}
          onPress={handleSubmit}
          style={applyStyles({width: '48%'})}
        />
      </View>
    </View>
  );
};
