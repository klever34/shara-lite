import React, {useCallback, useLayoutEffect} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {colors} from '../../../styles';
import ChatListScreen from './ChatListScreen';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import Icon from '../../../components/Icon';
import {getAuthService} from '../../../services';
import {useNavigation} from '@react-navigation/native';

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
        <Menu>
          <MenuTrigger>
            <Icon
              type="material-icons"
              color={colors.white}
              name="more-vert"
              size={30}
            />
          </MenuTrigger>
          <MenuOptions optionsContainerStyle={styles.menuDropdown}>
            <MenuOption text="Logout" onSelect={handleLogout} />
          </MenuOptions>
        </Menu>
      ),
    });
  }, [handleLogout, navigation]);
  return (
    <SafeAreaView style={styles.container}>
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

export const styles = StyleSheet.create({
  container: {flex: 1},
  menuDropdown: {
    padding: 8,
    maxWidth: 300,
  },
});

export default HomeScreen;
