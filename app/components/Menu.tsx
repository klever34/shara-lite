import React from 'react';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import {applyStyles} from '../helpers/utils';
import Icon from './Icon';
import {colors} from '../styles';
import {StyleSheet} from 'react-native';

type AppMenuProps = {
  options: {text: string; onSelect: () => void}[];
};

const AppMenu = ({options}: AppMenuProps) => {
  return (
    <Menu>
      <MenuTrigger
        customStyles={{
          triggerWrapper: applyStyles('mr-sm', {borderRadius: 12}),
        }}>
        <Icon
          type="material-icons"
          color={colors.white}
          name="more-vert"
          size={28}
          borderRadius={12}
        />
      </MenuTrigger>
      <MenuOptions optionsContainerStyle={styles.menuDropdown}>
        {options.map(({text, onSelect}) => {
          return (
            <MenuOption
              customStyles={{
                optionText: applyStyles('text-400', {
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
  );
};

export const styles = StyleSheet.create({
  menuDropdown: {
    padding: 8,
    maxWidth: 300,
  },
});

export default AppMenu;
