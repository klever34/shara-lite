import React from 'react';
import {View, Text} from 'react-native';
import {AuthView} from '@/components/AuthView';

const ForgotPassword = () => {
  return (
    <AuthView title="Forgot your password">
      <View>
        <Text>Foo</Text>
      </View>
    </AuthView>
  );
};

export default ForgotPassword;
