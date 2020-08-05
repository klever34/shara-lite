import React, {useEffect, useState, useCallback} from 'react';
import {
  FloatingLabelInput,
  FloatingLabelInputProps,
} from './FloatingLabelInput';
import {Text} from 'react-native';
import {applyStyles} from '../helpers/utils';
import {colors} from '../styles';
import {getAuthService} from '../services';

type Props = Omit<FloatingLabelInputProps, 'onChange' | 'onChangeText'> & {
  onChange?: (value: number) => void;
};

const toThousandString = (number: number) =>
  number ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

const toNumber = (value: string) => parseFloat(value.replace(/,/g, ''));

export const CurrencyInput = (props: Props) => {
  const authService = getAuthService();
  const currency = authService.getUserCurrency();
  const {value: valueProp, onChange, ...rest} = props;
  const numberValue = valueProp ? parseFloat(valueProp) : 0;
  const [value, setValue] = useState(
    valueProp ? toThousandString(numberValue) : '',
  );

  useEffect(() => {
    const number = valueProp ? parseFloat(valueProp) : 0;
    setValue(toThousandString(number));
  }, [valueProp]);

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
      inputStyle={applyStyles({paddingLeft: 32})}
      leftIcon={
        <Text
          style={applyStyles('text-400', {
            fontSize: 16,
            color: colors['gray-300'],
          })}>
          {currency}
        </Text>
      }
      {...rest}
    />
  );
};
