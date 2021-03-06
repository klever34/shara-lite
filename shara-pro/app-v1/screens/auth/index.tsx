import React, {useEffect} from 'react';
import {Welcome} from './Welcome';
import {Login} from './Login';
import {Register} from './Register';
import {createStackNavigator} from '@react-navigation/stack';
import ForgotPassword from 'app-v1/screens/auth/ForgotPassword';
import ResetPassword from 'app-v1/screens/auth/ResetPassword';
import {PhoneNumber} from 'app-v1/components';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: {mobile?: PhoneNumber};
  ResetPassword: {mobile: string};
};

const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthScreens = () => {
  useEffect(() => {
    // const realmService = getRealmService();
    const timer = setTimeout(() => {
      // realmService.clearRealm();
      clearTimeout(timer);
    }, 100);
  }, []);
  return (
    <AuthStack.Navigator>
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
    </AuthStack.Navigator>
  );
};
export default AuthScreens;
