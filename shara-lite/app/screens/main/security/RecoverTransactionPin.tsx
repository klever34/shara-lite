import {AppInput, Button} from '@/components';
import {Page} from '@/components/Page';
import {getApiService, getAuthService, getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {User} from 'types/app';

const strings = getI18nService().strings;

export const RecoverTransactionPin = (props: any) => {
  const {
    route: {
      params: {question},
    },
  } = props;
  const [answer, setAnswer] = useState('');
  const [, setLoading] = useState(false);
  const navigation = useAppNavigation();
  const authService = getAuthService();
  let user = authService.getUser() as User;

  const handleAnswerChange = useCallback((text) => {
    setAnswer(text);
  }, []);

  const handleSubmit = useCallback(async () => {
    const apiService = getApiService();
    setLoading(true);
    try {
      const payload = {answer, user_id: user.id};
      const {
        data: {token},
      } = await apiService.verifySecurityQuestions(payload);
      navigation.replace('ChangeTransactionPin', {
        token,
        heading: strings('withdrawal_pin.enter_new_transaction_pin'),
      });
    } catch (error) {
      setLoading(false);
      Alert.alert(strings('alert.error'), error.message);
    }
  }, [answer, navigation, user.id]);

  return (
    <Page
      header={{
        title: strings('withdrawal_pin.recover_transaction_pin.page_title'),
        iconLeft: {},
        style: applyStyles('py-8'),
      }}
      style={applyStyles('bg-white')}>
      <View style={applyStyles('flex-1')}>
        <Text style={applyStyles('text-gray-50 text-base mb-8 text-700')}>
          {question && question}
        </Text>
        <AppInput
          value={answer}
          onChangeText={handleAnswerChange}
          placeholder={strings(
            'withdrawal_pin.security_questions.answer_placeholder',
          )}
        />
        <View style={applyStyles('mt-32 items-end')}>
          <Button
            title={strings('save')}
            onPress={handleSubmit}
            style={applyStyles({width: '45%'})}
          />
        </View>
      </View>
    </Page>
  );
};
