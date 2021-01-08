import React, {useContext} from 'react';
import {AuthView, FormBuilder, FormFields, required} from '@/components';
import {getApiService, getI18nService} from '@/services';
import {ToastAndroid} from 'react-native';
import {useErrorHandler} from '@/services/error-boundary';
import {useRoute, RouteProp} from '@react-navigation/native';
import {AuthStackParamList} from '@/screens/auth/index';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import {ToastContext} from '@/components/Toast';

const i18nService = getI18nService();

const ResetPassword = () => {
  const handleError = useErrorHandler();
  const navigation = useAppNavigation();
  const {params} = useRoute<RouteProp<AuthStackParamList, 'ResetPassword'>>();

  const {showSuccessToast} = useContext(ToastContext);

  type FormFieldName = 'otp' | 'password' | 'repeat_password';

  const formFields: FormFields<FormFieldName> = {
    otp: {
      type: 'text',
      props: {
        autoFocus: true,
        placeholder: i18nService.strings('reset_password.otp_label'),
      },
      validations: [required(i18nService.strings('alert.required.otp'))],
    },
    password: {
      type: 'password',
      props: {
        placeholder: i18nService.strings('reset_password.password_label'),
      },
      validations: [required(i18nService.strings('alert.required.password'))],
    },
    repeat_password: {
      type: 'password',
      props: {
        placeholder: i18nService.strings(
          'reset_password.repeat_password_label',
        ),
      },
      validations: [required(i18nService.strings('alert.required.password'))],
    },
  };

  return (
    <AuthView
      header={{
        title: i18nService.strings('reset_password.header'),
        iconLeft: {},
      }}
      heading={i18nService.strings('reset_password.heading')}
      style={applyStyles('bg-white pt-24')}
      showButton={false}>
      <FormBuilder
        fields={formFields}
        actionBtns={[
          {title: i18nService.strings('reset_password.submit_button')},
        ]}
        onSubmit={(values) => {
          if (values?.repeat_password !== values?.password) {
            ToastAndroid.show(
              i18nService.strings('reset_password.password_match'),
              ToastAndroid.LONG,
            );
            return Promise.resolve();
          }
          return getApiService()
            .resetPassword({
              mobile: params.mobile,
              otp: values?.otp,
              password: values?.password,
            })
            .then(({message}) => {
              showSuccessToast(message, ToastAndroid.LONG);
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
