import React, {useState, useCallback} from 'react';
import {
  FloatingLabelInput,
  FloatingLabelInputProps,
} from './FloatingLabelInput';

type Props = Omit<FloatingLabelInputProps, 'onChange' | 'onChangeText'> & {
  onChange?: (value: number) => void;
};

const toThousandString = (number: number) =>
  number ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

const toNumber = (value: string) => parseFloat(value.replace(/,/g, ''));

export const CurrencyInput = (props: Props) => {
  const {value: valueProp, onChange, ...rest} = props;
  const numberValue = valueProp ? parseFloat(valueProp) : 0;
  const [value, setValue] = useState(
    valueProp ? toThousandString(numberValue) : '',
  );

  const handleChange = useCallback(
    (text) => {
      const number = toNumber(text);
      setValue(toThousandString(number));
      onChange && onChange(number);
    },
    [onChange],
  );

  return (
    <FloatingLabelInput
      value={value}
      keyboardType="number-pad"
      onChangeText={handleChange}
      {...rest}
    />
  );
};
