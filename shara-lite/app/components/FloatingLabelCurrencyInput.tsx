import {Text} from '@/components';
import {applyStyles} from '@/styles';
import {isFinite} from 'lodash';
import React, {forwardRef, useCallback, useEffect, useState} from 'react';
import {TextInput, TextStyle, View} from 'react-native';
import {getAuthService} from '../services';
import {
  FloatingLabelInput,
  FloatingLabelInputProps,
} from './FloatingLabelInput';

export type CurrencyInputProps = Omit<FloatingLabelInputProps, 'value'> & {
  value?: number;
  iconStyle?: TextStyle;
};

export const toNumber = (value: string) => parseFloat(value.replace(/,/g, ''));

const toThousandString = (text: string) => {
  const numberValue = toNumber(text);
  if (text.includes('.')) {
    const parts = text.split('.');

    if (parts.length > 1) {
      const n = parts[0] ? toNumber(parts[0]) : 0;
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

export const FlatFloatingLabelCurrencyInput = (props: CurrencyInputProps) => {
  return (
    <View style={applyStyles('bg-gray-20')}>
      <FloatingLabelCurrencyInput
        iconStyle={applyStyles('px-24', props.iconStyle)}
        labelStyle={applyStyles('px-24', props.labelStyle)}
        inputStyle={applyStyles({paddingLeft: 40}, props.inputStyle)}
        {...props}
      />
    </View>
  );
};

export const FloatingLabelCurrencyInput = forwardRef<
  TextInput,
  CurrencyInputProps
>((props: CurrencyInputProps) => {
  const authService = getAuthService();
  const currency = authService.getUserCurrency();
  const {value: valueProp, onChangeText, iconStyle, style, ...rest} = props;

  const [value, setValue] = useState(
    isFinite(valueProp) ? valueProp?.toString() : '',
  );

  const inputPaddingLeft = currency.length > 1 ? 'pl-48' : 'pl-32';

  useEffect(() => {
    if (valueProp !== undefined && isFinite(valueProp)) {
      setValue(toThousandString(valueProp.toString()));
    } else {
      setValue('');
    }
  }, [valueProp]);

  const handleChange = useCallback(
    (text) => {
      if (text && isFinite(toNumber(text))) {
        const stringValue = toThousandString(text);
        setValue(stringValue);
        onChangeText && onChangeText(stringValue);
      } else {
        setValue('');
        onChangeText && onChangeText('');
      }
    },
    [onChangeText],
  );

  return (
    <FloatingLabelInput
      value={value}
      keyboardType="numeric"
      onChangeText={handleChange}
      style={applyStyles(inputPaddingLeft, style)}
      leftIcon={
        <Text
          style={applyStyles('text-400 text-gray-300', {
            top: 4,
            fontSize: 16,
            ...iconStyle,
          })}>
          {currency}
        </Text>
      }
      {...rest}
    />
  );
});
