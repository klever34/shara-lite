import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import Icon, {IconProps} from './Icon';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import {applyStyles, colors} from '@/styles';
import {HeaderBackButton} from '@react-navigation/stack';

export type HeaderRightOption = {icon: Partial<IconProps>; onPress: () => void};
export type HeaderRightMenuOption = {text: string; onSelect: () => void};

export type HeaderRightProps = {
  loading?: boolean;
  options?: HeaderRightOption[];
  menuOptions?: HeaderRightMenuOption[];
};

export const HeaderRight = ({
  loading = false,
  options = [],
  menuOptions = [],
}: HeaderRightProps) => {
  return (
    <View style={applyStyles('flex-row mr-sm')}>
      {loading && (
        <ActivityIndicator
          color={colors.white}
          size={24}
          style={applyStyles('mr-sm')}
        />
      )}
      {options.map(({icon, onPress}) => {
        return (
          <HeaderBackButton
            key={icon.name}
            onPress={onPress}
            backImage={() => {
              return (
                <View style={applyStyles('center w-30 h-30 rounded-24')}>
                  <Icon
                    type="feathericons"
                    color={colors['gray-300']}
                    size={24}
                    {...icon}
                  />
                </View>
              );
            }}
          />
        );
      })}
      {!!menuOptions.length && (
        <Menu>
          <MenuTrigger
            customStyles={{
              triggerWrapper: applyStyles('mr-sm', {borderRadius: 12}),
            }}>
            <Icon
              type="material-icons"
              color={colors['gray-300']}
              name="more-vert"
              size={28}
              borderRadius={12}
            />
          </MenuTrigger>
          <MenuOptions
            optionsContainerStyle={applyStyles({
              maxWidth: 300,
            })}>
            {menuOptions.map(({text, onSelect}) => {
              return (
                <MenuOption
                  customStyles={{
                    optionText: applyStyles('text-400 p-md text-base', {
                      color: colors['gray-300'],
                    }),
                  }}
                  key={text}
                  text={text}
                  onSelect={onSelect}
                />
              );
            })}
          </MenuOptions>
        </Menu>
      )}
    </View>
  );
};
