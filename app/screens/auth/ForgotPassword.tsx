import React from 'react';
import {AuthView} from '@/components/AuthView';
import {FormBuilder} from '@/components';

const ForgotPassword = () => {
  return (
    <AuthView
      title="Forgot your password"
      description="Enter your mobile number to receive your OTP">
      <FormBuilder
        fields={{
          mobile: {
            type: 'text',
            props: {autoFocus: true, placeholder: ''},
          },
        }}
        submitBtn={{title: 'submit'}}
        onSubmit={(values) => {
          return new Promise((resolve) => {
            console.log(values);
            setTimeout(() => {
              resolve();
            }, 2000);
          });
        }}
      />
    </AuthView>
  );
};

export default ForgotPassword;
