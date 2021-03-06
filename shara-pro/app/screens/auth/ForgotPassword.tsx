import React from 'react';
import {
  AuthView,
  FormBuilder,
  FormFields,
  PhoneNumber,
  required,
} from '@/components';
import {AuthStackParamList} from '@/screens/auth/index';
import {getApiService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import {RouteProp, useRoute} from '@react-navigation/native';
import {Alert, ToastAndroid} from 'react-native';

const ForgotPassword = () => {
  const navigation = useAppNavigation();
  const {params} = useRoute<RouteProp<AuthStackParamList, 'ForgotPassword'>>();

  type FormFieldName = 'mobile';

  const formFields: FormFields<FormFieldName> = {
    mobile: {
      type: 'mobile',
      props: {
        autoFocus: true,
        placeholder: '',
        value: params.mobile,
      },
      validations: [required()],
    },
  };

  return (
    <AuthView
      showEmblem={false}
      header={{title: 'Forgot your password?', iconLeft: {}}}
      heading="Forgot your password?"
      style={applyStyles('bg-white pt-24')}
      description="Enter your mobile number to receive your OTP"
      showButton={false}>
      <FormBuilder
        fields={formFields}
        submitBtn={{title: 'submit'}}
        onSubmit={(values) => {
          const phoneNumber = values?.mobile as PhoneNumber;
          const mobile = `${phoneNumber.callingCode}${phoneNumber.number}`;
          return getApiService()
            .forgotPassword({
              mobile,
            })
            .then(({message}) => {
              ToastAndroid.show(message, ToastAndroid.LONG);
              navigation.replace('ResetPassword', {mobile});
            })
            .catch((error) => {
              Alert.alert('Error', error.message);
            });
        }}
        forceUseFormButton
      />
    </AuthView>
  );
};

export default ForgotPassword;
