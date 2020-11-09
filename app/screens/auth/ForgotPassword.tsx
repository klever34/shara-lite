import React, {useRef} from 'react';
import {AuthView, FormBuilder, FormFields, PhoneNumber} from '@/components';
import {getApiService} from '@/services';
import {ToastAndroid} from 'react-native';
import {useErrorHandler} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {RouteProp, useRoute} from '@react-navigation/native';
import {AuthStackParamList} from '@/screens/auth/index';
import {applyStyles} from '@/styles';

const ForgotPassword = () => {
  const handleError = useErrorHandler();
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
      required: true,
    },
  };

  const formValuesRef = useRef<Record<FormFieldName, any>>();

  return (
    <AuthView
      showEmblem={false}
      header={{title: 'Forgot your password?', iconLeft: {}}}
      heading="Forgot your password?"
      style={applyStyles('bg-white pt-24')}
      description="Enter your mobile number to receive your OTP"
      buttonTitle="submit"
      onSubmit={() => {
        const {current: values} = formValuesRef;
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
          .catch(handleError);
      }}>
      <FormBuilder
        fields={formFields}
        onInputChange={(values) => {
          formValuesRef.current = values;
        }}
      />
    </AuthView>
  );
};

export default ForgotPassword;
