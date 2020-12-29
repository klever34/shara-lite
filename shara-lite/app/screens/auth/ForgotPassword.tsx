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
import {strings} from '@/services/i18n';

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
      header={{title: strings('forgot_password.heading'), iconLeft: {}}}
      heading={strings('forgot_password.heading')}
      style={applyStyles('bg-white pt-24')}
      description={strings('forgot_password.subheading')}
      showButton={false}>
      <FormBuilder
        fields={formFields}
        actionBtns={[{title: strings('forgot_password.fp_button')}]}
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
