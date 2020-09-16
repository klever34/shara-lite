import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
} from 'react-native';
import {colors} from '@/styles';
import {applyStyles} from '@/helpers/utils';
import {Icon, IconProps} from '@/components/Icon';
import Touchable from '@/components/Touchable';

export type TextInputProps = RNTextInputProps & {
  icon?: IconProps & {
    activeStyle?: string;
    inactiveStyle?: string;
    onPress?: (active: boolean) => void;
  };
  initialValue?: string;
  initialToggle?: boolean;
};

const TextInput = ({
  style,
  icon,
  initialValue = '',
  initialToggle = false,
  ...restProps
}: TextInputProps) => {
  const [iconActive, setIconActive] = useState(initialToggle);
  const [value, setValue] = useState(initialValue);
  const onIconPress = useCallback(() => {
    setIconActive((prevActive) => {
      const nextActive = !prevActive;
      icon?.onPress?.(nextActive);
      return nextActive;
    });
  }, [icon]);
  return (
    <View
      style={applyStyles('flex-row mb-24 w-full border-b-1 border-gray-50')}>
      <RNTextInput
        {...restProps}
        value={value}
        onChangeText={(nextValue) => {
          restProps.onChangeText?.(nextValue);
          setValue(nextValue);
        }}
        style={applyStyles(styles.inputField, style, icon && 'flex-1 border-0')}
      />
      {icon && (
        <Touchable onPress={icon.onPress ? onIconPress : undefined}>
          <View style={applyStyles('w-48 h-48 center')}>
            <Icon
              size={24}
              {...icon}
              style={applyStyles(
                icon.style,
                iconActive ? icon.activeStyle : icon.inactiveStyle,
              )}
              onPress={icon.onPress ? onIconPress : undefined}
            />
          </View>
        </Touchable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputField: {
    fontSize: 18,
    width: '100%',
    borderBottomWidth: 1,
    fontFamily: 'Rubik-Regular',
    borderColor: colors['gray-200'],
  },
});

export default TextInput;
