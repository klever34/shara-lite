import React from 'react';
import {SafeAreaView} from 'react-native';
import {FAButton} from '../../../components';
import {MainStackParamList} from '../../../index';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarOptions,
} from '@react-navigation/material-top-tabs';
import {StackScreenProps} from '@react-navigation/stack';
import {colors} from '../../../styles/base';
import {ChatTab} from './ChatTab';
import {ContactsTab} from './ContactsTab';

type HomeTabParamList = {
  Chat: undefined;
  Contacts: undefined;
};

const HomeTab = createMaterialTopTabNavigator<HomeTabParamList>();

type HomeScreenProps = StackScreenProps<MainStackParamList> & {};

const tabBarOptions: MaterialTopTabBarOptions = {
  indicatorContainerStyle: {backgroundColor: colors.primary},
  indicatorStyle: {backgroundColor: colors.white},
  labelStyle: {fontWeight: 'bold'},
  activeTintColor: 'rgba(255,255,255, 1)',
  inactiveTintColor: 'rgba(255,255,255, 0.75)',
};

export const HomeScreen = ({navigation}: HomeScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <HomeTab.Navigator initialRouteName="Chat" tabBarOptions={tabBarOptions}>
        <HomeTab.Screen name="Chat" component={ChatTab} />
        <HomeTab.Screen name="Contacts" component={ContactsTab} />
      </HomeTab.Navigator>
      <FAButton
        iconName="add"
        onPress={() => {
          navigation.navigate('Chat');
        }}
      />
    </SafeAreaView>
  );
};

export const styles = {
  container: {flex: 1},
};
