import {applyStyles, colors} from '@/styles';
import React, {ReactNode, useCallback, useMemo} from 'react';
import {View, ViewStyle} from 'react-native';
import {Icon} from './Icon';
import Touchable from './Touchable';

export type CheckboxProps = {
  style?: ViewStyle;
  isChecked?: boolean;
  disabled?: boolean;
  borderColor?: string;
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
    checkedColor = 'bg-green-100',
    borderColor = colors['green-100'],
  } = props;

  const borderStyles = useMemo(() => {
    if (disabled && isChecked) {
      return {borderWidth: 2, borderColor: colors['gray-100']};
    }
    if (isChecked) {
      return {borderWidth: 2, borderColor};
    }
    return {borderWidth: 2, borderColor: colors['gray-50']};
  }, [disabled, isChecked]);

  const onPress = useCallback(() => {
    if (onChange && !disabled) {
      onChange(value);
    }
  }, [onChange, value, disabled]);

  const bgColor = useMemo(() => {
    if (disabled && isChecked) {
      return 'bg-gray-100';
    }
    if (isChecked) {
      return checkedColor;
    }
    return '';
  }, [disabled, isChecked, checkedColor]);

  return (
    <Touchable onPress={disabled ? undefined : onPress}>
      <View style={applyStyles('flex-row items-center', containerStyle)}>
        {leftLabel}
        <View
          style={applyStyles(
            'center w-24 h-24 rounded-4',
            bgColor,
            borderStyles,
            style,
          )}>
          {isChecked && (
            <Icon
              size={18}
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
