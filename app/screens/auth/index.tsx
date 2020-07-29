import React, {useEffect} from 'react';
import {Welcome} from './Welcome';
import {Login} from './Login';
import {Register} from './Register';
import {createStackNavigator} from '@react-navigation/stack';
import {getRealmService} from '../../services';

const AuthStack = createStackNavigator();

const AuthScreens = () => {
  useEffect(() => {
    const realmService = getRealmService();
    const timer = setTimeout(() => {
      realmService.clearRealm();
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
    </AuthStack.Navigator>
  );
};
export default AuthScreens;
