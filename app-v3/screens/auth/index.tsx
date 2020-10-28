import {PhoneNumber} from 'app-v3/components';
import ForgotPassword from 'app-v3/screens/auth/ForgotPassword';
import ResetPassword from 'app-v3/screens/auth/ResetPassword';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {BusinessSetup} from './BusinessSetup';
import {Login} from './Login';
import {Register} from './Register';
import {Welcome} from './Welcome';

export type AuthStackParamList = {
  Login: undefined;
  Welcome: undefined;
  Register: undefined;
  BusinessSetup: undefined;
  ResetPassword: {mobile: string};
  ForgotPassword: {mobile?: PhoneNumber};
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
      <AuthStack.Screen
        name="BusinessSetup"
        component={BusinessSetup}
        options={{headerShown: false}}
      />
    </AuthStack.Navigator>
  );
};
export default AuthScreens;
