import {PhoneNumber} from '@/components';
import ForgotPassword from '@/screens/auth/ForgotPassword';
import ResetPassword from '@/screens/auth/ResetPassword';
import {getStorageService} from '@/services';
import {applyStyles, colors} from '@/styles';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {Login} from './Login';
import {OTPVerification} from './OTPVerification';
import {Register} from './Register';
import {Welcome} from './Welcome';

export type AuthStackParamList = {
  Login: undefined;
  Welcome: undefined;
  Register: undefined;
  BusinessSetup: undefined;
  ResetPassword: {mobile: string};
  ForgotPassword: {mobile?: PhoneNumber};
  OTPVerification: {mobile: string; message: string; countryCode: string};
};

const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthScreens = () => {
  const [initialRouteName, setInitialRouteName] = useState<
    keyof AuthStackParamList | undefined
  >();

  useEffect(() => {
    // const realmService = getRealmService();
    const timer = setTimeout(() => {
      // realmService.clearRealm();
      clearTimeout(timer);
    }, 100);
  }, []);

  const storageService = getStorageService();
  const setInitialRoute = useCallback(async () => {
    const hideWelcomeScreen = await storageService.getItem(
      'hide-welcome-screen',
    );
    setInitialRouteName(hideWelcomeScreen ? 'Login' : 'Welcome');
  }, [storageService]);

  useEffect(() => {
    setInitialRoute();
  }, [setInitialRoute]);

  if (!initialRouteName) {
    return (
      <View style={applyStyles('flex-1 center')}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }

  return (
    <AuthStack.Navigator initialRouteName={initialRouteName}>
      <AuthStack.Screen
        name="Welcome"
        component={Welcome}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="Register"
        component={Register}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="OTPVerification"
        component={OTPVerification}
        options={{headerShown: false}}
      />
    </AuthStack.Navigator>
  );
};
export default AuthScreens;
