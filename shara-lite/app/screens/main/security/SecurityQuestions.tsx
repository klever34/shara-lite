import {AppInput, Button} from '@/components';
import {Page} from '@/components/Page';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback, useState} from 'react';
import {Alert, View} from 'react-native';

export const SecurityQuestions = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [, setLoading] = useState(false);
  const navigation = useAppNavigation();

  const handleQuestionChange = useCallback((text) => {
    setQuestion(text);
  }, []);

  const handleAnswerChange = useCallback((text) => {
    setAnswer(text);
  }, []);

  const handleSubmit = useCallback(() => {
    setLoading(true);
    try {
      navigation.navigate('VerifyTransactionPin', {question, answer});
    } catch (error) {
      setLoading(false);
      Alert.alert('error', error.message);
    }
  }, [answer, navigation, question]);

  return (
    <Page
      header={{
        title: 'Security question',
        iconLeft: {},
        style: applyStyles('py-8'),
      }}
      style={applyStyles('bg-white')}>
      <View style={applyStyles('flex-1')}>
        <AppInput
          value={question}
          onChangeText={handleQuestionChange}
          style={applyStyles('mb-16')}
          label={'Set a security question'}
          placeholder={'e.g Name of your first pet'}
        />
        <AppInput
          value={answer}
          onChangeText={handleAnswerChange}
          label={'Set your securtity answer'}
          placeholder={'Enter the answer to the above question here'}
        />
        <View style={applyStyles('mt-32 items-end')}>
          <Button
            title={'save'}
            onPress={handleSubmit}
            style={applyStyles({width: '45%'})}
          />
        </View>
      </View>
    </Page>
  );
};
