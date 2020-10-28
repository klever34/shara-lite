import {HeaderRight, HomeMenu} from '@/components';
import {Icon} from '@/components/Icon';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {applyStyles} from '@/helpers/utils';
import {getAnalyticsService, getAuthService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {RealmContext} from '@/services/realm/provider';
import {colors} from '@/styles';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import {
  HeaderBackButton,
  StackHeaderLeftButtonProps,
} from '@react-navigation/stack';
import React, {useCallback, useContext, useLayoutEffect} from 'react';
import {Alert, SafeAreaView, Text, View} from 'react-native';
import {ItemsTab, SalesTab} from './home';

type HomeTabParamList = {
  SalesTab: undefined;
  ItemsTab: undefined;
};

const HomeTab = createMaterialTopTabNavigator<HomeTabParamList>();

type HomeScreenProps = ModalWrapperFields & {};

const HomeScreen = ({openModal}: HomeScreenProps) => {
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
  const user = getAuthService().getUser();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: applyStyles('border-b-1', {
        elevation: 0,
      }),
      headerLeft: (props: StackHeaderLeftButtonProps) => {
        return (
          <HeaderBackButton
            {...props}
            onPress={() => {
              openModal('bottom-half', {
                renderContent: (contentProps) => <HomeMenu {...contentProps} />,
              });
            }}
            backImage={() => {
              return (
                <View style={applyStyles('flex-row center')}>
                  <Icon
                    type="material-icons"
                    color={colors['gray-300']}
                    name="dehaze"
                    size={28}
                    borderRadius={12}
                  />
                  <Text
                    style={applyStyles(
                      'pl-sm text-md text-gray-300 text-uppercase',
                      {
                        fontFamily: 'Rubik-Medium',
                      },
                    )}
                    numberOfLines={1}>
                    Menu
                  </Text>
                </View>
              );
            }}
          />
        );
      },
      headerTitle: () => null,
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
  }, [handleLogout, navigation, openModal, user]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <HomeTab.Navigator
        initialRouteName="SalesTab"
        tabBarOptions={{
          indicatorContainerStyle: {backgroundColor: colors.white},
          indicatorStyle: applyStyles('bg-primary h-4 rounded-2'),
          labelStyle: {fontFamily: 'Rubik-Regular'},
          activeTintColor: colors.primary,
          inactiveTintColor: colors['gray-300'],
        }}>
        <HomeTab.Screen
          name="SalesTab"
          component={SalesTab}
          options={{title: 'Sales'}}
        />
        <HomeTab.Screen
          name="ItemsTab"
          component={ItemsTab}
          options={{title: 'Items'}}
        />
      </HomeTab.Navigator>
    </SafeAreaView>
  );
};

export default withModal(HomeScreen);
