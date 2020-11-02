import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  TextInputProps as RNTextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import {applyStyles, colors} from '@/styles';
import {Icon, IconProps} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {FloatingLabelInput} from '@/components/FloatingLabelInput';

export type TextInputProps = Omit<RNTextInputProps, 'style'> & {
  icon?: IconProps & {
    activeStyle?: string;
    inactiveStyle?: string;
    onPress?: (active: boolean) => void;
  };
  initialToggle?: boolean;
  containerStyle?: ViewStyle;
};

const TextInput = ({
  value: initialValue = '',
  icon,
  initialToggle = false,
  containerStyle,
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
      style={applyStyles(
        'flex-row w-full border-b-1 border-gray-300',
        containerStyle,
      )}>
      <FloatingLabelInput
        {...restProps}
        value={value}
        onChangeText={(nextValue) => {
          restProps.onChangeText?.(nextValue);
          setValue(nextValue);
        }}
        containerStyle={applyStyles(icon && 'flex-1')}
        inputStyle={applyStyles(styles.inputField, 'border-b-0')}
      />
      {icon && (
        <Touchable onPress={icon.onPress ? onIconPress : undefined}>
          <View style={applyStyles('w-48 h-48 center self-end')}>
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
    borderColor: colors['gray-300'],
  },
});

export default TextInput;
