import {AppInput, Button} from '@/components';
import {Page} from '@/components/Page';
import {ToastContext} from '@/components/Toast';
import {getI18nService} from '@/services';
import {useFeedback} from '@/services/feedback';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import {useFormik} from 'formik';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Alert, View} from 'react-native';
import * as yup from 'yup';

const i18Service = getI18nService();

export default function ReferralScreen() {
  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        message: yup
          .string()
          .min(25, i18Service.strings('alert.feedback_validation'))
          .required(i18Service.strings('alert.feedback_is_empty')),
      }),
    [],
  );

  const navigation = useAppNavigation();
  const {saveFeedback} = useFeedback();
  const [loading, setLoading] = useState(false);
  const {showSuccessToast} = useContext(ToastContext);

  const onSubmit = useCallback(
    async ({message}) => {
      try {
        await saveFeedback({message});
        setLoading(true);
        showSuccessToast(i18Service.strings('feedback.toast_text'));
        navigation.goBack();
      } catch (error) {
        setLoading(false);
        Alert.alert(i18Service.strings('alert.error'), error.message);
      }
    },
    [saveFeedback, navigation, showSuccessToast],
  );

  const {errors, values, touched, handleSubmit, handleChange} = useFormik({
    validationSchema,
    initialValues: {message: ''},
    onSubmit,
  });

  return (
    <Page
      header={{
        iconLeft: {},
        style: applyStyles('py-8'),
        title: i18Service.strings('feedback.title'),
      }}
      style={applyStyles('bg-white')}>
      <View style={applyStyles('flex-1')}>
        <AppInput
          multiline={true}
          value={values.message}
          onChangeText={handleChange('message')}
          errorMessage={errors.message}
          isInvalid={touched.message && !!errors.message}
          containerStyle={applyStyles('mb-16')}
          style={applyStyles({
            height: 150,
            textAlignVertical: 'top',
          })}
          label={i18Service.strings('feedback.fields.code.label')}
          placeholder={i18Service.strings('feedback.fields.code.placeholder')}
        />
      </View>
      <Button
        disabled={!values.message}
        isLoading={loading}
        onPress={handleSubmit}
        title={i18Service.strings('feedback.submit_button')}
      />
    </Page>
  );
}
