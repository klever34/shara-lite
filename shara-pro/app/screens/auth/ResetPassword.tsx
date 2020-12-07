import React from 'react';
import {AuthView, FormBuilder, FormFields, required} from '@/components';
import {getApiService} from '@/services';
import {ToastAndroid} from 'react-native';
import {useErrorHandler} from '@/services/error-boundary';
import {useRoute, RouteProp} from '@react-navigation/native';
import {AuthStackParamList} from '@/screens/auth/index';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';

const ResetPassword = () => {
  const handleError = useErrorHandler();
  const navigation = useAppNavigation();
  const {params} = useRoute<RouteProp<AuthStackParamList, 'ResetPassword'>>();

  type FormFieldName = 'otp' | 'password' | 'repeat_password';

  const formFields: FormFields<FormFieldName> = {
    otp: {
      type: 'text',
      props: {autoFocus: true, placeholder: 'OTP'},
      validations: [required('OTP is required')],
    },
    password: {
      type: 'password',
      props: {placeholder: 'Enter you new password'},
      validations: [required('Password is required')],
    },
    repeat_password: {
      type: 'password',
      props: {placeholder: 'Enter your password again'},
      validations: [required('Password is required')],
    },
  };

  return (
    <AuthView
      header={{title: 'Reset your password', iconLeft: {}}}
      heading="Reset your password"
      style={applyStyles('bg-white pt-24')}
      showButton={false}>
      <FormBuilder
        fields={formFields}
        submitBtn={{title: 'submit'}}
        onSubmit={(values) => {
          if (values?.repeat_password !== values?.password) {
            ToastAndroid.show('Passwords do not match', ToastAndroid.LONG);
            return Promise.resolve();
          }
          return getApiService()
            .resetPassword({
              mobile: params.mobile,
              otp: values?.otp,
              password: values?.password,
            })
            .then(({message}) => {
              ToastAndroid.show(message, ToastAndroid.LONG);
              navigation.goBack();
            })
            .catch(handleError);
        }}
        forceUseFormButton
      />
    </AuthView>
  );
};

export default ResetPassword;
