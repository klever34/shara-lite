import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {RadioButton} from '@/components/RadioButton';
import {applyStyles} from '@/styles';
import {Text} from '@/components';
import {View, ViewStyle} from 'react-native';

export type RadioInputRef = {
  disabled: boolean;
  setValue: (checked: boolean) => void;
  setDisabled: Dispatch<SetStateAction<boolean>>;
};

export type RadioInputProps = {
  label?: string;
  value?: boolean;
  containerStyle?: ViewStyle;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  innerRef?: (node: RadioInputRef) => void;
};

export const RadioInput = ({
  value: initialValue = false,
  containerStyle,
  label,
  onChange,
  disabled: initialDisabled = false,
  innerRef,
}: RadioInputProps) => {
  const [value, setValue] = useState(initialValue);
  const [disabled, setDisabled] = useState(initialDisabled);
  const handleChange = useCallback(
    (checked: boolean) => {
      setValue(checked);
      onChange?.(checked);
    },
    [onChange],
  );

  useEffect(() => {
    if (innerRef) {
      innerRef({
        setValue: handleChange,
        disabled,
        setDisabled,
      });
    }
  }, [disabled, handleChange, innerRef]);

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
