import React, {useEffect, useState, useCallback} from 'react';
import {
  FloatingLabelInput,
  FloatingLabelInputProps,
} from './FloatingLabelInput';
import {Text, TextStyle, ViewStyle} from 'react-native';
import {colors} from '../styles';
import {getAuthService} from '../services';
import {applyStyles} from 'app-v3/styles';

type Props = Omit<FloatingLabelInputProps, 'onChange' | 'onChangeText'> & {
  onChange?: (value: number) => void;
  inputStyle?: ViewStyle;
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
  const {value: valueProp, onChange, inputStyle, iconStyle, ...rest} = props;
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
        setValue('0');
        onChange && onChange(0);
      }
    },
    [onChange],
  );

  return (
    <FloatingLabelInput
      value={value}
      keyboardType="number-pad"
      onChangeText={handleChange}
      inputStyle={applyStyles({paddingLeft, ...inputStyle})}
      leftIcon={
        <Text
          style={applyStyles('text-400', {
            fontSize: 16,
            color: colors['gray-300'],
            ...iconStyle,
          })}>
          {currency}
        </Text>
      }
      {...rest}
    />
  );
};
