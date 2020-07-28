import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {MenuProvider} from 'react-native-popup-menu';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from './screens/SplashScreen';
import AuthScreens from './screens/auth';
import MainScreens from './screens/main';
import Realm from 'realm';
import {createRealm, RealmProvider} from './services/realm';
import {getRealmService} from './services';
import {ActivityIndicator, Alert, View} from 'react-native';
import {colors} from './styles';
import {applyStyles} from './helpers/utils';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();

const App = () => {
  const [realm, setRealm] = useState<Realm | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    createRealm()
      .then((nextRealm) => {
        const realmService = getRealmService();
        realmService.setInstance(nextRealm);
        setRealm(nextRealm);
      })
      .catch(() => {
        setError(true);
        Alert.alert(
          'Oops! Something went wrong.',
          'Try clearing app data from application settings',
        );
      });
  }, []);
  if (error) {
    return null;
  }
  if (!realm) {
    return (
      <View style={applyStyles('flex-1 center')}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }
  return (
    <RealmProvider value={realm}>
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
    </RealmProvider>
  );
};

export default App;
