import {applyStyles, colors} from '@/styles';
import React, {useCallback} from 'react';
import {Text} from '@/components';
import {StyleSheet, View, ViewStyle} from 'react-native';
import Touchable from './Touchable';

type Props = {
  value: string;
  label?: string;
  style?: ViewStyle;
  isChecked?: boolean;
  onChange?: (value: string) => void;
};

export const PaymentMethodOption = (props: Props) => {
  const {label, style, value, onChange, isChecked} = props;

  const onPress = useCallback(() => {
    if (isChecked) {
      onChange && onChange('');
    } else {
      onChange && onChange(value);
    }
  }, [isChecked, onChange, value]);

  const stateStyle = isChecked ? styles.checked : styles.unchecked;
  const labelStyle = isChecked ? styles.labelChecked : styles.labelUnchecked;

  return (
    <Touchable onPress={onPress}>
      <View
        style={applyStyles(
          'items-center justify-center',
          styles.base,
          stateStyle,
          style,
        )}>
        <Text style={applyStyles('text-400 text-uppercase', labelStyle)}>
          {label}
        </Text>
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 32,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  checked: {
    borderColor: colors['gray-300'],
  },
  unchecked: {
    borderColor: colors['gray-50'],
  },
  labelUnchecked: {
    fontFamily: 'Rubik-Regular',
    color: colors['gray-200'],
  },
  labelChecked: {
    fontFamily: 'Rubik-Medium',
    color: colors['gray-300'],
  },
});
