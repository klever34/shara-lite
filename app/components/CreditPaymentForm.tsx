import {Picker} from '@react-native-community/picker';
import React, {useCallback, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button} from '.';
import {applyStyles} from '../helpers/utils';
import {colors} from '../styles';
import {CurrencyInput} from './CurrencyInput';

type Payload = {
  amount: string;
  method: string;
};

type Props = {
  isLoading: boolean;
  onSubmit(data: Payload, callback: () => void): void;
};

export const CreditPaymentForm = (props: Props) => {
  const {isLoading, onSubmit} = props;
  const [payload, setPayload] = useState<Payload>({
    method: 'cash',
    amount: '',
  } as Payload);

  const handleChange = useCallback(
    (value: string | number, key: keyof Payload) => {
      setPayload({
        ...payload,
        [key]: value,
      });
    },
    [payload],
  );

  const clearForm = useCallback(() => {
    setPayload({} as Payload);
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(payload, clearForm);
  }, [clearForm, onSubmit, payload]);

  return (
    <View>
      <View style={applyStyles('flex-row', 'items-center')}>
        <CurrencyInput
          label="Amount Paid"
          value={payload.amount}
          keyboardType="number-pad"
          containerStyle={styles.input}
          onChange={(text) => handleChange(text, 'amount')}
        />
      </View>
      <View style={styles.pickerContainer}>
        <Text style={applyStyles('text-400', styles.pickerLabel)}>
          Payment method
        </Text>
        <Picker
          mode="dropdown"
          style={styles.picker}
          prompt="Payment Method"
          itemStyle={styles.pickerItem}
          selectedValue={payload.method}
          onValueChange={(itemValue) => handleChange(itemValue, 'method')}>
          <Picker.Item label="Cash" value="cash" />
          <Picker.Item label="Bank Transfer" value="transfer" />
          <Picker.Item label="Mobile Money" value="mobile" />
        </Picker>
      </View>

      <Button
        isLoading={isLoading}
        onPress={handleSubmit}
        title="Confirm payment"
        disabled={isLoading || !payload.amount}
        style={applyStyles({marginBottom: 40})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    paddingBottom: 40,
    color: colors.primary,
    fontFamily: 'Rubik-Regular',
  },
  pickerContainer: {
    marginBottom: 40,
    borderBottomWidth: 1,
    borderColor: colors['gray-200'],
  },
  pickerLabel: {
    color: colors['gray-100'],
  },
  picker: {
    paddingBottom: 12,
    fontFamily: 'Rubik-Regular',
  },
  pickerItem: {
    color: colors['gray-300'],
    fontFamily: 'Rubik-Regular',
  },
});
