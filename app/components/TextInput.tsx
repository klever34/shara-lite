import React, {useCallback, useState} from 'react';
import {View, ViewStyle} from 'react-native';
import {applyStyles} from '@/styles';
import {Icon, IconProps} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {AppInput, AppInputProps} from '@/components/AppInput';

export type TextInputProps = Omit<AppInputProps, 'style'> & {
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
    <View style={applyStyles('flex-row w-full', containerStyle)}>
      <AppInput
        {...restProps}
        value={value}
        onChangeText={(nextValue) => {
          restProps.onChangeText?.(nextValue);
          setValue(nextValue);
        }}
        containerStyle={applyStyles('flex-1')}
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

export default TextInput;
