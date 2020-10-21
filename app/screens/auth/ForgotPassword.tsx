import React from 'react';
import {AuthView, FormBuilder, PhoneNumber} from '@/components';
import {getApiService} from '@/services';
import {ToastAndroid} from 'react-native';
import {useErrorHandler} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {RouteProp, useRoute} from '@react-navigation/native';
import {AuthStackParamList} from '@/screens/auth/index';

const ForgotPassword = () => {
  const handleError = useErrorHandler();
  const navigation = useAppNavigation();
  const {params} = useRoute<RouteProp<AuthStackParamList, 'ForgotPassword'>>();
  return (
    <AuthView
      title="Forgot your password"
      description="Enter your mobile number to receive your OTP">
      <FormBuilder
        fields={{
          mobile: {
            type: 'mobile',
            props: {
              autoFocus: true,
              placeholder: '',
              value: params.mobile,
            },
            required: true,
          },
        }}
        submitBtn={{title: 'submit'}}
        onSubmit={(values) => {
          const phoneNumber = values.mobile as PhoneNumber;
          const mobile = `${phoneNumber.code}${phoneNumber.number}`;
          return getApiService()
            .forgotPassword({
              mobile,
            })
            .then(({message}) => {
              ToastAndroid.show(message, ToastAndroid.LONG);
              navigation.replace('ResetPassword', {mobile});
            })
            .catch(handleError);
        }}
      />
    </AuthView>
  );
};

export default ForgotPassword;
