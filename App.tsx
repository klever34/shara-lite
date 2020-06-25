import 'react-native-gesture-handler';
import React from 'react';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Chat, Welcome, Login, Register} from './screens';
import {PUBNUB_SUB_KEY, PUBNUB_PUB_KEY} from 'react-native-dotenv';
import SplashScreen from './screens/SplashScreen';

const pubnub = new PubNub({
  subscribeKey: PUBNUB_SUB_KEY,
  publishKey: PUBNUB_PUB_KEY,
});

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();

const AuthStack = createStackNavigator();

const MainStack = createStackNavigator();

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
const MainScreens = () => (
  <MainStack.Navigator>
    <MainStack.Screen name="Chat" component={Chat} />
  </MainStack.Navigator>
);

const App = () => {
  return (
    <NavigationContainer>
      <PubNubProvider client={pubnub}>
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
      </PubNubProvider>
    </NavigationContainer>
  );
};
export default App;
