import {applyStyles} from 'app-v3/helpers/utils';
import {colors} from 'app-v3/styles';
import React, {useCallback} from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import {useFilterButtonGroup} from './FilterButtonGroup';
import Touchable from './Touchable';

type Props = {
  value: string;
  label?: string;
  style?: ViewStyle;
  isChecked?: boolean;
  onChange?: (value: string) => void;
};

export const FilterButton = (props: Props) => {
  const {label, style, value, onChange: onChangedProp, isChecked} = props;

  const group = useFilterButtonGroup();

  let checked = isChecked || false;
  if (group?.value && props.value) {
    checked = group.value === props.value;
  }

  let onChange = onChangedProp;
  if (group?.onChange && props.value) {
    onChange = group.onChange;
  }

  const onPress = useCallback(() => {
    if (checked) {
      onChange && onChange(value);
    } else {
      onChange && onChange(value);
    }
  }, [checked, onChange, value]);

  const stateStyle = checked ? styles.checked : styles.unchecked;
  const labelStyle = checked ? styles.labelChecked : styles.labelUnchecked;

  return (
    <Touchable onPress={onPress}>
      <View
        style={applyStyles(
          'items-center justify-center',
          styles.base,
          stateStyle,
          style,
        )}>
        <Text
          style={applyStyles('text-400 text-uppercase text-xs', labelStyle)}>
          {label}
        </Text>
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  checked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  unchecked: {
    borderColor: colors['gray-50'],
  },
  labelUnchecked: {
    fontFamily: 'Rubik-Regular',
    color: colors['gray-200'],
  },
  labelChecked: {
    color: colors.white,
    fontFamily: 'Rubik-Bold',
  },
});
