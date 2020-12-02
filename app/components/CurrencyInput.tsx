import {applyStyles} from '@/styles';
import {isNumber} from 'lodash';
import React, {forwardRef, useCallback, useEffect, useState} from 'react';
import {Text, TextInput, TextStyle} from 'react-native';
import {getAuthService} from '../services';
import {AppInput, AppInputProps} from './AppInput';

type CurrencyInputProps = Omit<AppInputProps, 'value'> & {
  value?: number;
  iconStyle?: TextStyle;
};

export const toNumber = (value: string) => parseFloat(value.replace(/,/g, ''));

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
    return new Intl.NumberFormat().format(numberValue);
  }
};

export const CurrencyInput = forwardRef<TextInput, CurrencyInputProps>(
  (props: CurrencyInputProps, ref) => {
    const authService = getAuthService();
    const currency = authService.getUserCurrency();
    const {value: valueProp, onChangeText, iconStyle, style, ...rest} = props;

    const [value, setValue] = useState(
      isNumber(valueProp) ? valueProp?.toString() : '',
    );

    const inputPaddingLeft = currency.length > 1 ? 'pl-48' : 'pl-32';

    useEffect(() => {
      if (valueProp) {
        valueProp && setValue(toThousandString(valueProp.toString()));
      }
    }, [valueProp]);

    const handleChange = useCallback(
      (text) => {
        if (text) {
          const stringValue = toThousandString(text);
          setValue(stringValue);
          onChangeText && onChangeText(stringValue);
        } else {
          setValue('');
        }
      },
      [onChangeText],
    );

    return (
      <AppInput
        ref={ref}
        value={value}
        keyboardType="numeric"
        onChangeText={handleChange}
        style={applyStyles(inputPaddingLeft, style)}
        leftIcon={
          <Text
            style={applyStyles('text-700 text-gray-300', {
              top: 1,
              fontSize: 16,
              ...iconStyle,
            })}>
            {currency}
          </Text>
        }
        {...rest}
      />
    );
  },
);
