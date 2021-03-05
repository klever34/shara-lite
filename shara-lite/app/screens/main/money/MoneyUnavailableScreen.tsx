import React, {useContext, useEffect, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {AppInput, Text, Button} from '@/components';
import {getI18nService, getStorageService} from '@/services';
import {as} from '@/styles';
import {useFeedback} from '@/services/feedback';
import {useFormik} from 'formik';
import {ToastContext} from '@/components/Toast';

const strings = getI18nService().strings;

export const MoneyUnavailableScreen = () => {
  const [submitted, setSubmitted] = useState(true);
  useEffect(() => {
    getStorageService()
      .getItem('@shara/shara-money-feedback-given')
      .then((value) => {
        setSubmitted(!!value);
      });
  });
  const {saveFeedback} = useFeedback();
  const {showSuccessToast} = useContext(ToastContext);
  const {values, handleSubmit, handleChange} = useFormik({
    initialValues: {message: ''},
    onSubmit: ({message}) => {
      return saveFeedback({message}).then(() => {
        setSubmitted(true);
        showSuccessToast(strings('payment_activities.feedback_submitted'));
        getStorageService()
          .setItem('@shara/shara-money-feedback-given', true)
          .then(() => {});
      });
    },
  });
  return (
    <SafeAreaView style={as('flex-1 justify-center px-16')}>
      <View>
        <Text style={as('text-center font-bold text-2xl mb-8')}>
          {strings('payment_activities.not_available.title')}
        </Text>
        <Text style={as('text-center leading-24 mb-32')}>
          {strings('payment_activities.not_available.description')}
        </Text>
        {!submitted && (
          <>
            <AppInput
              style={as('mb-16')}
              label={strings(
                'payment_activities.not_available.fields.method_of_disbursement.label',
              )}
              value={values.message}
              onChangeText={handleChange('message')}
            />
            <Button
              title={strings('submit')}
              onPress={handleSubmit}
              disabled={!values.message}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};
