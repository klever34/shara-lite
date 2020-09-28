import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useLayoutEffect} from 'react';
import {useErrorHandler} from '@/services/error-boundary';
import {Alert, SafeAreaView, View} from 'react-native';
import HeaderRight from '../../components/HeaderRight';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {applyStyles} from '@/helpers/utils';
import {getAnalyticsService, getAuthService} from '@/services';
import {colors} from '@/styles';
import {RealmContext} from '@/services/realm/provider';
import HeaderTitle from '@/components/HeaderTitle';
import Touchable from '@/components/Touchable';
import {Icon} from '@/components/Icon';
import {HomeMenu} from '@/components/HomeMenu';

const SalesTab = () => null;
const ItemsTab = () => null;

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
      headerLeft: () => {
        return (
          <Touchable
            onPress={() => {
              openModal('bottom-half', {renderContent: HomeMenu});
            }}>
            <View style={applyStyles('center ml-4 w-48 h-48')}>
              <Icon
                type="material-icons"
                color={colors['gray-300']}
                name="dehaze"
                size={28}
                borderRadius={12}
              />
            </View>
          </Touchable>
        );
      },
      // TODO: What should be displayed when the business setup is not done
      headerTitle: () => (
        <HeaderTitle title={user?.businesses?.[0].name ?? 'Business Name'} />
      ),
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
