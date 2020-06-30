import 'react-native-gesture-handler';
import React from 'react';
import {MenuProvider} from 'react-native-popup-menu';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from './screens/SplashScreen';
import AuthScreens from './screens/auth';
import MainScreens from './screens/main';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <MenuProvider>
        <RootStack.Navigator initialRouteName="Splash">
          <RootStack.Screen
            name="Splash"
            component={SplashScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="Auth"
            component={AuthScreens}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="Main"
            component={MainScreens}
            options={{headerShown: false}}
          />
        </RootStack.Navigator>
      </MenuProvider>
    </NavigationContainer>
  );
};
export default App;
