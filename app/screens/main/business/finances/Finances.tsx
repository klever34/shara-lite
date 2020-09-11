import {getAuthService} from '@/services';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useLayoutEffect} from 'react';
import {useErrorHandler} from '@/services/error-boundary';
import {Alert, SafeAreaView, View} from 'react-native';
import HeaderRight from '../../../../components/HeaderRight';
import {applyStyles} from '@/helpers/utils';
import {useScreenRecord} from '@/services/analytics';
import {colors} from '@/styles';
import {MyCredit, MyInventory, MyReceipts} from './index';

type TabStackParamList = {
  Credit: undefined;
  Receipts: undefined;
  Inventory: undefined;
};

const TabStack = createMaterialTopTabNavigator<TabStackParamList>();

export const Finances = () => {
  useScreenRecord();
  const navigation = useNavigation();

  const handleError = useErrorHandler();
  const handleLogout = useCallback(async () => {
    try {
      const authService = getAuthService();
      await authService.logOut();
      navigation.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      });
    } catch (e) {
      handleError(e);
    }
  }, [handleError, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={applyStyles('flex-row flex-1 items-center')}>
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
        </View>
      ),
    });
  }, [handleLogout, navigation]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <TabStack.Navigator
        tabBarOptions={{
          activeTintColor: 'rgba(255,255,255, 1)',
          labelStyle: {fontFamily: 'Rubik-Regular'},
          inactiveTintColor: 'rgba(255,255,255, 0.75)',
          indicatorStyle: {backgroundColor: colors.white},
          indicatorContainerStyle: {backgroundColor: colors.primary},
        }}>
        <TabStack.Screen name="Receipts" component={MyReceipts} />
        <TabStack.Screen name="Credit" component={MyCredit} />
        <TabStack.Screen name="Inventory" component={MyInventory} />
      </TabStack.Navigator>
    </SafeAreaView>
  );
};
