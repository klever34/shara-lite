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

const toThousandString = (text: string) => {
  const numberValue = toNumber(text);
  if (text.includes('.')) {
    const parts = text.split('.');

    if (parts.length > 1) {
      const n = toNumber(parts[0]);
      const part0 = new Intl.NumberFormat('en-GB').format(n);
      const part1 = parts[1].toString().substring(0, 2);
      return `${part0}.${part1}`;
    } else {
      return text;
    }
  } else {
    return new Intl.NumberFormat('en-GB', {
      style: 'decimal',
      maximumFractionDigits: 2,
    }).format(numberValue);
  }
};

const toNumber = (value: string) => parseFloat(value.replace(/,/g, ''));

export const CurrencyInput = (props: Props) => {
  const authService = getAuthService();
  const currency = authService.getUserCurrency();
  const {value: valueProp, onChange, ...rest} = props;
  const [value, setValue] = useState(valueProp);

  const paddingLeft = currency.length > 1 ? 36 : 16;

  useEffect(() => {
    if (valueProp) {
      valueProp && setValue(toThousandString(valueProp));
    }
  }, [valueProp]);

  const handleChange = useCallback(
    (text) => {
      if (text) {
        const numberValue = toNumber(text);
        const stringValue = toThousandString(text);
        setValue(stringValue);
        onChange && onChange(numberValue);
      } else {
        setValue('');
      }
    },
    [onChange],
  );

  return (
    <FloatingLabelInput
      value={value}
      keyboardType="number-pad"
      onChangeText={handleChange}
      inputStyle={applyStyles({paddingLeft})}
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
