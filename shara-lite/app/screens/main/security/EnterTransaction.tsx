import Icon from '@/components/Icon';
import {Page} from '@/components/Page';
import {getApiService, getAuthService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import React, {useCallback, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {User} from 'types/app';

export const EnterTransaction = (props: any) => {
  const {
    route: {
      params: {question, answer},
    },
  } = props;
  const [pin, setPin] = useState('');
  const [, setLoading] = useState(false);
  const authService = getAuthService();
  let user = authService.getUser() as User;
  const navigation = useAppNavigation();

  const handlePinChange = useCallback((code) => {
    setPin(code);
  }, []);

  const handleSubmit = useCallback(
    async (pin: string) => {
      const apiService = getApiService();
      setLoading(true);
      try {
        const payload = {pin};
        const res = await apiService.verifyTransactionPin(
          user.id.toString(),
          payload,
        );
        if (res?.data.token) {
          const securityQuestionPayload = {
            user_id: user.id,
            token: res.data.token,
            answer,
            question,
          };
          await apiService.setSecurityQuestions(securityQuestionPayload);
          navigation.navigate('SuccessScreen');
        }
      } catch (error) {
        setLoading(false);
        Alert.alert('error', error.message);
      }
    },
    [answer, navigation, question, user.id],
  );

  return (
    <Page
      header={{
        iconLeft: {},
        title: 'Set TRANSACTION PIN',
        style: applyStyles('py-8'),
      }}
      style={applyStyles('px-0 py-32')}>
      <View style={applyStyles('center py-32')}>
        <Text
          style={applyStyles(
            'text-center text-black text-lg pt-16 px-8 mt-32',
          )}>
          Enter your new tranaction PIN
        </Text>
        <View style={applyStyles('flex-row pt-8')}>
          <Icon
            size={18}
            name="lock"
            type="feathericons"
            color={colors['gray-100']}
          />
          <Text style={applyStyles('text-center text-gray-100 text-base px-6')}>
            All transactions are safe, secure and instant.
          </Text>
        </View>
        <OTPInputView
          code={pin}
          pinCount={4}
          autoFocusOnLoad={true}
          secureTextEntry={true}
          onCodeFilled={handleSubmit}
          onCodeChanged={handlePinChange}
          style={applyStyles('flex-row center', {
            height: 100,
            width: 100,
          })}
          codeInputFieldStyle={applyStyles('w-20 h-45 text-black', {
            fontSize: 18,
            borderWidth: 0,
            borderRadius: 0,
            borderBottomWidth: 4,
          })}
          codeInputHighlightStyle={applyStyles({
            borderColor: colors.primary,
          })}
        />
      </View>
    </Page>
  );
};
