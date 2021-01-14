import {AppInput, Button} from '@/components';
import {Page} from '@/components/Page';
import {ToastContext} from '@/components/Toast';
import {getI18nService} from '@/services';
import {useFeedback} from '@/services/feedback';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback, useContext, useState} from 'react';
import {Alert, View} from 'react-native';

const i18Service = getI18nService();

export default function ReferralScreen() {
  const navigation = useAppNavigation();
  const {saveFeedback} = useFeedback();

  const [feedback, setFeedback] = useState('');
  const {showSuccessToast} = useContext(ToastContext);

  const handleChange = useCallback((text) => {
    setFeedback(text);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      await saveFeedback({message: feedback});
      showSuccessToast(i18Service.strings('feedback.toast_text'));
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [saveFeedback, navigation, showSuccessToast, feedback]);

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
          value={feedback}
          multiline={true}
          onChangeText={handleChange}
          style={applyStyles('mb-16')}
          label={i18Service.strings('feedback.fields.code.label')}
          placeholder={i18Service.strings('feedback.fields.code.placeholder')}
        />
      </View>
      <Button
        onPress={handleSubmit}
        title={i18Service.strings('feedback.submit_button')}
      />
    </Page>
  );
}
