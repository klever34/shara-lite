import React, {useCallback, useContext, useLayoutEffect, useMemo} from 'react';
import {Text, View, Image, ScrollView} from 'react-native';
import {useAppNavigation} from 'app-v3/services/navigation';
import {
  HeaderBackButton,
  StackHeaderLeftButtonProps,
} from '@react-navigation/stack';
import {Icon} from 'app-v3/components/Icon';
import {colors, dimensions} from 'app-v3/styles';
import {getAuthService} from 'app-v3/services';
import Touchable from 'app-v3/components/Touchable';
import {applyStyles} from 'app-v3/styles';
import {RealmContext} from 'app-v3/services/realm/provider';
import {useErrorHandler} from 'app-v3/services/error-boundary';
import {getAnalyticsService} from 'app-v3/services';
import {version} from '../../../../package.json';

export const MoreOptionsScreen = () => {
  const navigation = useAppNavigation();
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
            backImage={() => {
              return (
                <View style={applyStyles('flex-row center')}>
                  <Icon
                    type="feathericons"
                    color={colors['gray-300']}
                    name="menu"
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
                    More
                  </Text>
                </View>
              );
            }}
          />
        );
      },
      headerTitle: () => null,
    });
  }, [navigation]);

  const onEditBusinessSettings = useCallback(() => {}, []);

  const moreOptions = useMemo(() => {
    return [
      {
        title: 'Profile Settings',
        icon: 'user',
        onPress: () => {},
      },
      {
        title: 'Business Settings',
        icon: 'sliders',
        onPress: onEditBusinessSettings,
      },
      {
        title: 'Reports',
        icon: 'eye',
        onPress: () => {},
      },
      {
        title: 'Reminder Settings',
        icon: 'users',
        onPress: () => {},
      },
      {
        title: 'App Lock',
        icon: 'users',
        onPress: () => {},
      },
      {
        title: 'Help & Support',
        icon: 'users',
        onPress: () => {},
      },
    ];
  }, [onEditBusinessSettings]);

  const {logoutFromRealm} = useContext(RealmContext);
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

  return (
    <ScrollView>
      <View style={applyStyles({minHeight: dimensions.fullHeight - 120})}>
        {user && (
          <View style={applyStyles('p-16 flex-row items-center')}>
            <View style={applyStyles('w-80 h-80')}>
              <Image
                style={applyStyles('w-full h-full')}
                source={{
                  uri: 'https://reactnative.dev/img/tiny_logo.png',
                }}
              />
            </View>
            <View style={applyStyles('flex-1 px-12')}>
              <Text
                style={applyStyles(
                  'text-700 uppercase text-sm leading-16 text-gray-300 mb-4',
                )}>
                {user.businesses[0].name}
              </Text>
              <Text
                style={applyStyles('text-400 text-sm leading-16 mb-4', {
                  color: colors['gray-300'],
                })}>
                {user.mobile}
              </Text>
              <Text
                style={applyStyles('text-400 text-xs leading-16 uppercase', {
                  color: colors['gray-100'],
                })}>
                ID: {user.id}
              </Text>
            </View>
            <HeaderBackButton
              onPress={onEditBusinessSettings}
              backImage={() => (
                <View style={applyStyles('center w-48 h-48')}>
                  <Icon
                    type="feathericons"
                    name="edit"
                    size={24}
                    color={colors['gray-50']}
                    onPress={onEditBusinessSettings}
                  />
                </View>
              )}
            />
          </View>
        )}
        <View style={applyStyles('mb-32')}>
          {moreOptions.map(({title, icon, onPress}, index) => {
            return (
              <Touchable onPress={onPress} key={title}>
                <View
                  style={applyStyles(
                    'flex-row items-center py-16 px-16 border-t-1 border-gray-20',
                    index === moreOptions.length - 1 && 'border-b-1',
                  )}>
                  <View style={applyStyles('flex-row flex-1')}>
                    <Icon
                      type="feathericons"
                      color={colors['red-100']}
                      name={icon}
                      size={20}
                      style={applyStyles('mr-8')}
                    />
                    <Text style={applyStyles('text-400 text-sm text-gray-300')}>
                      {title}
                    </Text>
                  </View>
                  <Icon
                    type="feathericons"
                    color={colors['gray-50']}
                    name="chevron-right"
                    size={20}
                  />
                </View>
              </Touchable>
            );
          })}
        </View>
        <View style={applyStyles('flex-1')}>
          <Touchable onPress={handleLogout}>
            <View
              style={applyStyles(
                'flex-row border-1 border-gray-20 center p-16 mx-16 rounded-md',
              )}>
              <Icon
                type="feathericons"
                color={colors['gray-50']}
                name="log-out"
                size={20}
                style={applyStyles('mr-24')}
              />
              <Text style={applyStyles('text-gray-100 text-sm font-bold')}>
                Log Out
              </Text>
            </View>
          </Touchable>
        </View>
        <View style={applyStyles('py-32 center')}>
          <Text style={applyStyles('text-gray-50 text-xxs font-bold mb-16')}>
            Version {version}
          </Text>
          <Image
            source={require('../../../assets/images/shara_logo_grey.png')}
            style={applyStyles('w-72 h-16')}
          />
        </View>
      </View>
    </ScrollView>
  );
};
