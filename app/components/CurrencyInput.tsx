import {applyStyles} from '@/styles';
import React, {useCallback, useEffect, useState} from 'react';
import {Text, TextStyle} from 'react-native';
import {getAuthService} from '../services';
import {AppInput, AppInputProps} from './AppInput';

type Props = Omit<AppInputProps, 'onChange' | 'onChangeText'> & {
  onChange?: (value: number) => void;
  iconStyle?: TextStyle;
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
  const {value: valueProp, onChange, iconStyle, style, ...rest} = props;

  const [value, setValue] = useState(valueProp);

  const inputPaddingLeft = currency.length > 1 ? 'pl-48' : 'pl-32';

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
        setValue('0');
        onChange && onChange(0);
      }
    },
    [onChange],
  );

  return (
    <AppInput
      value={value}
      keyboardType="numeric"
      onChangeText={handleChange}
      style={applyStyles(inputPaddingLeft, style)}
      leftIcon={
        <Text
          style={applyStyles('text-700 text-gray-300', {
            top: -1,
            fontSize: 16,
            ...iconStyle,
          })}>
          {currency}
        </Text>
      }
      {...rest}
    />
  );
};
