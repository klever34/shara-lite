import React, {useState, useCallback} from 'react';
import {View, TextInput, StyleSheet, Text} from 'react-native';
import {Picker} from '@react-native-community/picker';
import {colors} from '../../../styles';
import {Button} from '../../../components';
import {applyStyles} from '../../../helpers/utils';

type Payload = {
  amount: string;
  paymentMethod: string | number;
};

type Props = {
  isLoading: boolean;
  onSubmit(data: Payload, callback: () => void): void;
};

const CreditPaymentForm = (props: Props) => {
  const {isLoading, onSubmit} = props;
  const [payload, setPayload] = useState<Payload>({
    paymentMethod: 'cash',
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
        <View style={styles.textInputIcon}>
          <Text style={applyStyles(styles.textInputIconText, 'text-400')}>
            &#8358;
          </Text>
        </View>
        <TextInput
          value={payload.amount}
          keyboardType="number-pad"
          placeholder="Amount Paid"
          placeholderTextColor={colors['gray-50']}
          onChangeText={(text) => handleChange(text, 'amount')}
          style={applyStyles('flex-1', 'pl-lg', 'text-400', styles.input)}
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
          selectedValue={payload.paymentMethod}
          onValueChange={(itemValue) =>
            handleChange(itemValue, 'paymentMethod')
          }>
          <Picker.Item label="Cash" value="Cash" />
          <Picker.Item label="Credit" value="Credit" />
        </Picker>
      </View>

      <Button
        isLoading={isLoading}
        onPress={handleSubmit}
        title="Confirm payment"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 18,
    width: '100%',
    marginBottom: 24,
    borderBottomWidth: 1,
    fontFamily: 'Rubik-Regular',
    borderColor: colors['gray-200'],
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
  textInputIcon: {
    top: 14,
    position: 'absolute',
  },
  textInputIconText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
});

export default CreditPaymentForm;
