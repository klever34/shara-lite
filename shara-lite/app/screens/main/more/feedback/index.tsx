import {AppInput, Button} from '@/components';
import {Page} from '@/components/Page';
import {ToastContext} from '@/components/Toast';
import {useFeedback} from '@/services/feedback';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback, useContext, useState} from 'react';
import {Alert, View} from 'react-native';

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
      showSuccessToast(
        'Thank for your Feedback, we will get back to you shortly',
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [saveFeedback, navigation, showSuccessToast, feedback]);

  return (
    <Page
      header={{title: 'Feedback', iconLeft: {}, style: applyStyles('py-8')}}
      style={applyStyles('bg-white')}>
      <View style={applyStyles('flex-1')}>
        <AppInput
          value={feedback}
          label="Feedback"
          onChangeText={handleChange}
          style={applyStyles('mb-16')}
          placeholder="Enter feedback here"
          multiline={true}
        />
      </View>
      <Button title="Submit" onPress={handleSubmit} />
    </Page>
  );
}
