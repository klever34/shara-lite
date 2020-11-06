import React, {useCallback, useState} from 'react';
import {RadioButton} from '@/components/RadioButton';
import {applyStyles} from '@/styles';
import {Text, View, ViewStyle} from 'react-native';

export type RadioInputProps = {
  label?: string;
  value?: boolean;
  containerStyle?: ViewStyle;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
};

export const RadioInput = ({
  value: initialValue = false,
  containerStyle,
  label,
  onChange,
  disabled,
}: RadioInputProps) => {
  const [value, setValue] = useState(initialValue);
  const handleChange = useCallback(
    (checked: boolean) => {
      setValue(checked);
      onChange?.(checked);
    },
    [onChange],
  );
  return (
    <View style={applyStyles(' w-full', containerStyle)}>
      <RadioButton
        isChecked={value}
        containerStyle={applyStyles('py-16 mb-24 center')}
        onChange={handleChange}
        disabled={disabled}>
        <Text style={applyStyles('text-400 text-gray-300 text-base')}>
          {label ?? ''}
        </Text>
      </RadioButton>
    </View>
  );
};
