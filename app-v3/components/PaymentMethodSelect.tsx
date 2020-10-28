import {applyStyles} from 'app-v3/helpers/utils';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {PaymentMethodOption} from './PaymentMethodOption';

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
};

type Method = {
  label: string;
  value: string;
};

export const PaymentMethodSelect = (props: Props) => {
  const {value, onChange} = props;

  const formatPaymentMethod = useCallback(() => {
    if (value.length) {
      return value.map((item) => ({label: item, value: item}));
    }
    return [];
  }, [value]);

  const [paymentMethod, setPaymentMethod] = useState<Method[]>(
    formatPaymentMethod(),
  );

  useEffect(() => {
    setPaymentMethod(formatPaymentMethod());
  }, [formatPaymentMethod, value]);

  const handleChange = useCallback(
    (text, label) => {
      const methods = paymentMethod.map((item) => item.label);
      if (methods.includes(label)) {
        const result = paymentMethod.map((item) => {
          if (item.label === label) {
            return {
              ...item,
              value: text,
            };
          }
          return item;
        });

        setPaymentMethod(result);
        onChange(
          result.filter((item) => !!item.value).map((item) => item.value),
        );
      } else {
        const result = [...paymentMethod, {label, value: text}];
        setPaymentMethod(result);
        onChange(
          result.filter((item) => !!item.value).map((item) => item.value),
        );
      }
    },
    [onChange, paymentMethod],
  );

  return (
    <View style={applyStyles('flex-row items-center flex-wrap')}>
      <PaymentMethodOption
        value="cash"
        label="Cash"
        style={applyStyles('mr-sm mb-sm')}
        isChecked={value.includes('cash')}
        onChange={(text) => handleChange(text, 'cash')}
      />
      <PaymentMethodOption
        value="mpesa"
        label="Mpesa"
        style={applyStyles('mr-sm mb-sm')}
        isChecked={value.includes('mpesa')}
        onChange={(text) => handleChange(text, 'mpesa')}
      />
      <PaymentMethodOption
        value="pos"
        label="Pos"
        style={applyStyles('mr-sm mb-sm')}
        isChecked={value.includes('pos')}
        onChange={(text) => handleChange(text, 'pos')}
      />
      <PaymentMethodOption
        value="transfer"
        label="Bank Transfer"
        style={applyStyles('mb-sm')}
        isChecked={value.includes('transfer')}
        onChange={(text) => handleChange(text, 'transfer')}
      />
    </View>
  );
};
