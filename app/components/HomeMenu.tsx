import {getAuthService} from '@/services';
import {Text, View} from 'react-native';
import {applyStyles} from '@/helpers/utils';
import Touchable from '@/components/Touchable';
import {Icon} from '@/components/Icon';
import {colors} from '@/styles';
import React, {useMemo} from 'react';
import {useAppNavigation} from '@/services/navigation';
import {BottomHalfContentProps} from 'types/modal';

type HomeMenuProps = BottomHalfContentProps & {};

export const HomeMenu = ({closeModal}: HomeMenuProps) => {
  const user = getAuthService().getUser();
  const navigation = useAppNavigation();
  const homeMenuOptions = useMemo<
    {
      title: string;
      icon: string;
      onPress: () => void;
    }[]
  >(
    () => [
      {
        title: 'Business Settings',
        icon: 'sliders',
        onPress: () => {
          closeModal?.();
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
        },
      },
    ],
    [closeModal, navigation],
  );
  return (
    <View style={applyStyles('pt-8 pb-8')}>
      <View style={applyStyles('px-16')}>
        <Text style={applyStyles('text-700 text-sm leading-16 mb-8')}>
          Menu
        </Text>
        {user && (
          <View>
            <Text style={applyStyles('text-400 text-xs leading-16')}>
              User ID: {user.id}
            </Text>
            <Text style={applyStyles('text-400 text-xs leading-16')}>
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
                <Text style={applyStyles('text-lg')}>{title}</Text>
              </View>
            </Touchable>
          );
        })}
      </View>
    </View>
  );
};
