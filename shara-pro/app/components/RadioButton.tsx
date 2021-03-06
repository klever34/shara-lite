import {applyStyles, colors} from '@/styles';
import React, {ReactNode, useCallback} from 'react';
import {View, ViewStyle} from 'react-native';
import Touchable from './Touchable';

export type RadioButtonProps = {
  style?: ViewStyle;
  isChecked?: boolean;
  children?: ReactNode;
  containerStyle?: ViewStyle;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
};

export const RadioButton = (props: RadioButtonProps) => {
  const {
    children,
    style,
    onChange,
    isChecked,
    containerStyle,
    disabled = false,
  } = props;
  const borderStyles = isChecked
    ? {borderWidth: 2, borderColor: colors['red-50']}
    : {borderWidth: 2, borderColor: colors['gray-50']};

  const onPress = useCallback(() => {
    onChange && onChange(!isChecked);
  }, [isChecked, onChange]);

  return (
    <Touchable onPress={disabled ? undefined : onPress}>
      <View style={applyStyles(containerStyle)}>
        <View style={applyStyles('flex-row items-center')}>
          <View
            style={applyStyles(
              'center w-24 h-24 bg-gray-10 rounded-8',
              borderStyles,
              style,
            )}>
            {isChecked && (
              <View style={applyStyles('w-16 h-16 bg-red-100 rounded-6')} />
            )}
          </View>
          <View style={applyStyles('ml-8')}>{children}</View>
        </View>
      </View>
    </Touchable>
  );
};
