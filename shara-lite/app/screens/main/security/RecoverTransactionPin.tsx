import {AppInput, Button} from '@/components';
import {Page} from '@/components/Page';
import {getApiService, getAuthService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, View} from 'react-native';
import {User} from 'types/app';

export const RecoverTransactionPin = () => {
  const [answer, setAnswer] = useState('');
  const [, setLoading] = useState(false);
  const navigation = useAppNavigation();
  const authService = getAuthService();
  let user = authService.getUser() as User;

  const handleAnswerChange = useCallback((text) => {
    setAnswer(text);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const apiService = getApiService();
      setLoading(true);
      try {
        console.log('i get here');
        const res = await apiService.getSecurityQuestions(user.id);
        console.log('and here');
        console.log(res);
        console.log(user.id);
      } catch (error) {
        setLoading(false);
        handleError(error);
        Alert.alert('error', error.message);
      }
    };

    fetchData();
  }, [user.id]);

  // const handleSubmit = useCallback(() => {
  //   const apiService = getApiService();
  //   setLoading(true);
  //   try {
  //     navigation.navigate('VerifyTransactionPin');
  //   } catch (error) {
  //     setLoading(false);
  //     Alert.alert('error', error.message);
  //   }
  // }, [answer, navigation, question]);

  return (
    <Page
      header={{
        title: 'Security question',
        iconLeft: {},
        style: applyStyles('py-8'),
      }}
      style={applyStyles('bg-white')}>
      <View style={applyStyles('flex-1')}>
        {/* <AppInput
          // value={question}
          // onChangeText={handleQuestionChange}
          style={applyStyles('mb-16')}
          label={'Set a security question'}
          placeholder={'e.g Name of your first pet'}
        /> */}
        <AppInput
          value={answer}
          onChangeText={handleAnswerChange}
          label={'Set your securtity answer'}
          placeholder={'Enter the answer to the above question here'}
        />
        <View style={applyStyles('mt-32 items-end')}>
          <Button
            title={'save'}
            // onPress={handleSubmit}
            style={applyStyles({width: '45%'})}
          />
        </View>
      </View>
    </Page>
  );
};
