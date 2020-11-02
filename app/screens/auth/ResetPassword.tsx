import React from 'react';
import {AuthView, FormBuilder} from '@/components';
import {getApiService} from '@/services';
import {ToastAndroid} from 'react-native';
import {useErrorHandler} from '@/services/error-boundary';
import {useRoute, RouteProp} from '@react-navigation/native';
import {AuthStackParamList} from '@/screens/auth/index';
import {useAppNavigation} from '@/services/navigation';

const ResetPassword = () => {
  const handleError = useErrorHandler();
  const {params} = useRoute<RouteProp<AuthStackParamList, 'ResetPassword'>>();
  const navigation = useAppNavigation();
  return (
    <AuthView
      title="Reset password"
      heading="Reset your password"
      showButton={false}>
      <FormBuilder
        fields={{
          otp: {
            type: 'text',
            props: {autoFocus: true, placeholder: 'OTP'},
            required: true,
          },
          password: {
            type: 'password',
            props: {placeholder: 'Enter you new password'},
            required: true,
          },
          repeat_password: {
            type: 'password',
            props: {placeholder: 'Enter your password again'},
            required: true,
          },
        }}
        submitBtn={{title: 'submit'}}
        onSubmit={(values) => {
          if (values.repeat_password !== values.password) {
            ToastAndroid.show('Passwords do not match', ToastAndroid.LONG);
            return Promise.resolve();
          }
          return getApiService()
            .resetPassword({
              mobile: params.mobile,
              otp: values.otp,
              password: values.password,
            })
            .then(({message}) => {
              ToastAndroid.show(message, ToastAndroid.LONG);
              navigation.goBack();
            })
            .catch(handleError);
        }}
      />
    </AuthView>
  );
};

export default ResetPassword;
