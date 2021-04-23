import {AppInput, Button} from '@/components';
import {Page} from '@/components/Page';
import {getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback, useState} from 'react';
import {Alert, View} from 'react-native';

const strings = getI18nService().strings;

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
      Alert.alert(strings('error'), error.message);
    }
  }, [answer, navigation, question]);

  return (
    <Page
      header={{
        title: strings('withdrawal_pin.security_questions.page_title'),
        iconLeft: {},
        style: applyStyles('py-8'),
      }}
      style={applyStyles('bg-white')}>
      <View style={applyStyles('flex-1')}>
        <AppInput
          value={question}
          onChangeText={handleQuestionChange}
          style={applyStyles('mb-16')}
          label={strings('withdrawal_pin.security_questions.question_label')}
          placeholder={strings(
            'withdrawal_pin.security_questions.answer_placeholder',
          )}
        />
        <AppInput
          value={answer}
          onChangeText={handleAnswerChange}
          label={strings('withdrawal_pin.security_questions.answer_label')}
          placeholder={strings(
            'withdrawal_pin.security_questions.answer_placeholder',
          )}
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
