import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import {MenuProvider} from 'react-native-popup-menu';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Chat, Login, Register, Welcome} from './screens';
import Config from 'react-native-config';
import SplashScreen from './screens/SplashScreen';
import {colors} from './styles/base';
import StorageService from './services/StorageService';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

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

const MainScreens = () => {
  const [pubnubInstance, setPubnubInstance] = useState<any>(null);
  useEffect(() => {
    StorageService.getItem('user').then((user) => {
      const pubnub = new PubNub({
        subscribeKey: Config.PUBNUB_SUB_KEY,
        publishKey: Config.PUBNUB_PUB_KEY,
        uuid: user.mobile,
      });
      setPubnubInstance(pubnub);
    });
  }, []);
  if (!pubnubInstance) {
    return (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }
  return (
    <PubNubProvider client={pubnubInstance}>
      <MainStack.Navigator>
        <MainStack.Screen
          name="Chat"
          component={Chat}
          options={{
            title: 'Shara Chat',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: '#fff',
          }}
        />
      </MainStack.Navigator>
    </PubNubProvider>
  );
};

const styles = StyleSheet.create({
  activityIndicatorContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

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
