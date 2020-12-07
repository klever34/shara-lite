import React, {forwardRef, useCallback, useEffect, useState} from 'react';
import {View, ViewStyle, TextInput as RNTextInput} from 'react-native';
import {applyStyles} from '@/styles';
import {Icon, IconProps} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {AppInput, AppInputProps} from '@/components/AppInput';

export type TextInputFieldRef = {onChangeText: (value: string) => void};

export type TextInputProps = Omit<AppInputProps, 'style'> & {
  icon?: IconProps & {
    activeStyle?: string;
    inactiveStyle?: string;
    onPress?: (active: boolean) => void;
  };
  initialToggle?: boolean;
  containerStyle?: ViewStyle;
  innerRef?: (node: TextInputFieldRef) => void;
};

const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      value: initialValue = '',
      icon,
      initialToggle = false,
      containerStyle,
      innerRef,
      ...restProps
    },
    ref,
  ) => {
    const [iconActive, setIconActive] = useState(initialToggle);
    const [value, setValue] = useState(initialValue);

    const onIconPress = useCallback(() => {
      setIconActive((prevActive) => {
        const nextActive = !prevActive;
        icon?.onPress?.(nextActive);
        return nextActive;
      });
    }, [icon]);

    const onChangeText = useCallback(
      (nextValue: string) => {
        restProps.onChangeText?.(nextValue);
        setValue(nextValue);
      },
      [restProps.onChangeText],
    );

    useEffect(() => {
      if (innerRef) {
        innerRef({
          onChangeText,
        });
      }
    }, [innerRef, onChangeText]);

    return (
      <View style={applyStyles('flex-row w-full', containerStyle)}>
        <AppInput
          ref={ref}
          {...restProps}
          value={value}
          onChangeText={onChangeText}
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
  },
);

export default TextInput;
