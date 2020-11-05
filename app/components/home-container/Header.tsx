import {applyStyles, colors} from '@/styles';
import React from 'react';
import {Image, Text, View} from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import {HeaderRightMenuOption} from '../HeaderRight';
import {Icon} from '../Icon';

export const HomeContainerHeader = ({
  title,
  amount,
  activeFilter,
  menuOptions = [],
}: {
  title?: string;
  amount?: string;
  activeFilter?: string;
  menuOptions?: HeaderRightMenuOption[];
}) => {
  return (
    <View
      style={applyStyles(
        'p-16 flex-row items-center justify-between bg-white',
        {
          zIndex: 10,
        },
      )}>
      <View style={applyStyles('flex-row items-center')}>
        <Image
          resizeMode="contain"
          style={applyStyles('w-full rounded-8', {
            width: 32,
            height: 32,
          })}
          source={require('@/assets/images/shara-user-img.png')}
        />
        <View style={applyStyles('pl-8')}>
          <Text
            style={applyStyles(
              'text-uppercase text-xs text-400 text-gray-200',
            )}>
            {title}
          </Text>
          <Text
            style={applyStyles(
              'text-uppercase text-lg text-700 text-gray-300',
            )}>
            {amount}
          </Text>
        </View>
      </View>

      {!!menuOptions && !!menuOptions.length && (
        <View style={applyStyles('flex-row items-center')}>
          <Menu>
            <MenuTrigger
              customStyles={{
                triggerWrapper: applyStyles('mr-sm p-8 pr-0', {
                  borderRadius: 12,
                }),
              }}>
              <View style={applyStyles('flex-row items-center')}>
                <Text
                  style={applyStyles('text-uppercase text-400 text-gray-200')}>
                  {activeFilter}
                </Text>
                <Icon
                  size={20}
                  borderRadius={12}
                  name="chevron-down"
                  type="feathericons"
                  color={colors['gray-50']}
                />
              </View>
            </MenuTrigger>
            <MenuOptions
              optionsContainerStyle={applyStyles({
                maxWidth: 150,
              })}>
              {menuOptions.map(({text, onSelect}) => {
                return (
                  <MenuOption
                    customStyles={{
                      optionText: applyStyles(
                        'text-400 text-right py-xs px-md text-base text-gray-100 text-uppercase',
                      ),
                    }}
                    key={text}
                    text={text}
                    onSelect={onSelect}
                  />
                );
              })}
            </MenuOptions>
          </Menu>
        </View>
      )}
    </View>
  );
};
