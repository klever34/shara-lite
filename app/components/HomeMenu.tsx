import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {applyStyles} from '@/helpers/utils';
import {getAuthService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {colors} from '@/styles';
import React from 'react';
import {Text, View} from 'react-native';
import {BottomHalfContentProps} from 'types/modal';

type HomeMenuProps = BottomHalfContentProps & {};

export const HomeMenu = ({closeModal}: HomeMenuProps) => {
  const user = getAuthService().getUser();
  const navigation = useAppNavigation();
  const homeMenuOptions = [
    {
      title: 'Business Settings',
      icon: 'sliders',
      onPress: () => {
        closeModal?.();
        navigation.navigate('BusinessSettings');
      },
    },
    {
      title: 'User Profile',
      icon: 'user',
      onPress: () => {
        closeModal?.();
        navigation.navigate('UserProfileSettings');
      },
    },
    {
      title: 'My Customers',
      icon: 'users',
      onPress: () => {
        closeModal?.();
        navigation.navigate('Customers');
      },
    },
    {
      title: 'Reports',
      icon: 'eye',
      onPress: () => {
        closeModal?.();
        navigation.navigate('Reports');
      },
    },
  ];

  return (
    <View style={applyStyles('pt-8 pb-8')}>
      <View style={applyStyles('px-16')}>
        <Text style={applyStyles('text-700 text-uppercase leading-16 mb-8')}>
          Menu
        </Text>
        {user && (
          <View style={applyStyles('mb-md')}>
            <Text
              style={applyStyles('text-400 text-sm leading-16', {
                color: colors['gray-200'],
              })}>
              User ID: {user.id}
            </Text>
            <Text
              style={applyStyles('text-400 text-sm leading-16', {
                color: colors['gray-200'],
              })}>
              Phone Number: {user.mobile}
            </Text>
          </View>
        )}
      </View>
      <View>
        {homeMenuOptions.map(({title, icon, onPress}) => {
          return (
            <Touchable onPress={onPress} key={title}>
              <View style={applyStyles('flex-row items-center py-16 px-16')}>
                <Icon
                  type="feathericons"
                  color={colors['red-100']}
                  name={icon}
                  size={24}
                  style={applyStyles('mr-8')}
                />
                <Text
                  style={applyStyles('text-400 text-lg', {
                    color: colors['gray-300'],
                  })}>
                  {title}
                </Text>
              </View>
            </Touchable>
          );
        })}
      </View>
    </View>
  );
};
