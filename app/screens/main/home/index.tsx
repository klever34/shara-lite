import React, {useCallback, useEffect, useLayoutEffect} from 'react';
import {SafeAreaView} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {colors} from '../../../styles';
import ChatListScreen from './ChatListScreen';
import {getAuthService} from '../../../services';
import {useNavigation} from '@react-navigation/native';
import AppMenu from '../../../components/Menu';
import {applyStyles} from '../../../helpers/utils';
import {IConversation} from '../../../models';
import {usePubNub} from 'pubnub-react';
import {useRealm} from '../../../services/realm';

type HomeTabParamList = {
  ChatList: undefined;
  Contacts: undefined;
};

const HomeTab = createMaterialTopTabNavigator<HomeTabParamList>();

const HomeScreen = () => {
  const navigation = useNavigation();
  const handleLogout = useCallback(async () => {
    const authService = getAuthService();
    await authService.logOut();
    navigation.reset({
      index: 0,
      routes: [{name: 'Auth'}],
    });
  }, [navigation]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AppMenu options={[{text: 'Log out', onSelect: handleLogout}]} />
      ),
    });
  }, [handleLogout, navigation]);

  const pubNub = usePubNub();
  const realm = useRealm();

  useEffect(() => {
    if (pubNub) {
      const channels: string[] = [pubNub.getUUID()];

      if (realm) {
        const conversations = realm.objects<IConversation>('Conversation');
        channels.push(
          ...conversations.map((conversation) => conversation.channel),
        );
      }

      pubNub.subscribe({channels});
    }
    return () => {
      if (pubNub) {
        pubNub.unsubscribeAll();
      }
    };
  }, [pubNub, realm]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <HomeTab.Navigator
        initialRouteName="ChatList"
        tabBarOptions={{
          indicatorContainerStyle: {backgroundColor: colors.primary},
          indicatorStyle: {backgroundColor: colors.white},
          labelStyle: {fontWeight: 'bold'},
          activeTintColor: 'rgba(255,255,255, 1)',
          inactiveTintColor: 'rgba(255,255,255, 0.75)',
        }}>
        <HomeTab.Screen
          name="ChatList"
          options={{title: 'Chat'}}
          component={ChatListScreen}
        />
      </HomeTab.Navigator>
    </SafeAreaView>
  );
};

export default HomeScreen;
