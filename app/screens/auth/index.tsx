import React from 'react';
import {Welcome} from './Welcome';
import {Login} from './Login';
import {Register} from './Register';
import {createStackNavigator} from '@react-navigation/stack';

const AuthStack = createStackNavigator();

const AuthScreens = () => (
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

export default AuthScreens;
