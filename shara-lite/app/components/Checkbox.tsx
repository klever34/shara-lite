import {applyStyles, colors} from '@/styles';
import React, {ReactNode, useCallback} from 'react';
import {View, ViewStyle} from 'react-native';
import {Icon} from './Icon';
import Touchable from './Touchable';

export type CheckboxProps = {
  style?: ViewStyle;
  isChecked?: boolean;
  disabled?: boolean;
  checkedColor?: string;
  value: any;
  containerStyle?: ViewStyle;
  leftLabel?: ReactNode | string;
  rightLabel?: ReactNode | string;
  onChange?: (value?: any) => void;
};

export const Checkbox = (props: CheckboxProps) => {
  const {
    style,
    value,
    onChange,
    leftLabel,
    isChecked,
    rightLabel,
    containerStyle,
    disabled = false,
    checkedColor = 'bg-red-200',
  } = props;
  const borderStyles = isChecked
    ? {borderWidth: 2, borderColor: colors['red-200']}
    : {borderWidth: 2, borderColor: colors['gray-50']};

  const onPress = useCallback(() => {
    if (onChange) {
      onChange(value);
    }
  }, [onChange, value]);

  return (
    <Touchable onPress={disabled ? undefined : onPress}>
      <View style={applyStyles('flex-row items-center', containerStyle)}>
        {leftLabel}
        <View
          style={applyStyles(
            'center w-24 h-24 rounded-2',
            isChecked ? checkedColor : '',
            borderStyles,
            style,
          )}>
          {isChecked && (
            <Icon
              size={20}
              name="check"
              type="feathericons"
              color={colors.white}
            />
          )}
        </View>
        {rightLabel}
      </View>
    </Touchable>
  );
};
