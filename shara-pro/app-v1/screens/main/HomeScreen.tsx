import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useLayoutEffect} from 'react';
import {useErrorHandler} from 'app-v1/services/error-boundary';
import {Alert, SafeAreaView} from 'react-native';
import HeaderRight from '../../components/HeaderRight';
import {withModal} from 'app-v1/helpers/hocs';
import {applyStyles} from 'app-v1/helpers/utils';
import {getAnalyticsService, getAuthService} from 'app-v1/services';
import {colors} from 'app-v1/styles';
import {BusinessTab} from './business';
import CustomersTab from './customers';
import {RealmContext} from 'app-v1/services/realm/provider';

type HomeTabParamList = {
  ChatList: undefined;
  Customers: undefined;
  Business: undefined;
};

const HomeTab = createMaterialTopTabNavigator<HomeTabParamList>();

const HomeScreen = () => {
  const {logoutFromRealm} = useContext(RealmContext);
  const navigation = useNavigation();
  const handleError = useErrorHandler();

  const handleLogout = useCallback(async () => {
    try {
      const authService = getAuthService();
      await authService.logOut();
      getAnalyticsService().logEvent('logout').catch(handleError);
      navigation.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      });
      logoutFromRealm && logoutFromRealm();
    } catch (e) {
      handleError(e);
    }
  }, [handleError, navigation, logoutFromRealm]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          menuOptions={[
            {
              text: 'Log out',
              onSelect: () => {
                Alert.alert('Log Out', 'Are you sure you want to log out?', [
                  {
                    text: 'CANCEL',
                  },
                  {
                    text: 'OK',
                    onPress: handleLogout,
                  },
                ]);
              },
            },
          ]}
        />
      ),
    });
  }, [handleLogout, navigation]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <HomeTab.Navigator
        initialRouteName="Business"
        tabBarOptions={{
          indicatorContainerStyle: {backgroundColor: colors.primary},
          indicatorStyle: {backgroundColor: colors.white},
          labelStyle: {fontFamily: 'Rubik-Regular'},
          activeTintColor: 'rgba(255,255,255, 1)',
          inactiveTintColor: 'rgba(255,255,255, 0.75)',
        }}>
        <HomeTab.Screen
          name="Business"
          component={BusinessTab}
          options={{title: 'My Business'}}
        />
        <HomeTab.Screen
          name="Customers"
          component={CustomersTab}
          options={{title: 'My Customers'}}
        />
      </HomeTab.Navigator>
    </SafeAreaView>
  );
};

export default withModal(HomeScreen);
