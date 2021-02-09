import {AppInput, Button} from '@/components';
import {Page} from '@/components/Page';
import {ToastContext} from '@/components/Toast';
import {getI18nService} from '@/services';
import {useFeedback} from '@/services/feedback';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback, useContext, useState} from 'react';
import {Alert, Text, View} from 'react-native';

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
      if (feedback.length < 25) {
        Alert.alert(
          i18Service.strings('warning'),
          i18Service.strings('alert.error'),
        );
        return;
      }
      await saveFeedback({message: feedback});
      showSuccessToast(i18Service.strings('feedback.toast_text'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(i18Service.strings('alert.error'), error.message);
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
          style={applyStyles('mb-16', {
            height: 150,
            textAlignVertical: 'top',
          })}
          label={i18Service.strings('feedback.fields.code.label')}
          placeholder={i18Service.strings('feedback.fields.code.placeholder')}
        />
        <Text
          style={applyStyles('absolute', {paddingTop: 140, paddingLeft: 212})}>
          Characters Count: {feedback.length}
        </Text>
      </View>
      <Button
        onPress={handleSubmit}
        title={i18Service.strings('feedback.submit_button')}
      />
    </Page>
  );
}
