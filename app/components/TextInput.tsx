import React, {useState} from 'react';
import {
  StyleSheet,
  TextInputProps as RNTextInputProps,
  View,
} from 'react-native';
import {colors} from '@/styles';
import {applyStyles} from '@/helpers/utils';
import {Icon, IconProps} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {FloatingLabelInput} from '@/components/FloatingLabelInput';

export type TextInputProps = RNTextInputProps & {
  icon?: IconProps & {
    activeStyle?: string;
    inactiveStyle?: string;
    onPress?: (active: boolean) => void;
  };
  initialToggle?: boolean;
};

const TextInput = ({
  style,
  icon,
  value: initialValue = '',
  initialToggle = false,
  ...restProps
}: TextInputProps) => {
  const [iconActive, setIconActive] = useState(initialToggle);
  const [value, setValue] = useState(initialValue);
  return (
    <View style={applyStyles('relative mb-24 w-full', icon && 'pb-48')}>
      <FloatingLabelInput
        {...restProps}
        value={value}
        onChangeText={(nextValue) => {
          restProps.onChangeText?.(nextValue);
          setValue(nextValue);
        }}
        style={applyStyles(styles.inputField, style)}
      />
      {icon && (
        <Touchable
          onPress={
            icon.onPress
              ? () => {
                  setIconActive((prevActive) => {
                    const nextActive = !prevActive;
                    icon.onPress?.(nextActive);
                    return nextActive;
                  });
                }
              : undefined
          }>
          <View
            style={applyStyles(
              'w-48 h-48 absolute top-0 bottom-0 right-0 center',
            )}>
            <Icon
              size={24}
              {...icon}
              style={applyStyles(
                icon.style,
                iconActive ? icon.activeStyle : icon.inactiveStyle,
              )}
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
