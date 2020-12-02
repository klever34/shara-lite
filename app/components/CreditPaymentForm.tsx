import {Picker} from '@react-native-community/picker';
import React, {useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button} from './Button';
import {colors} from '../styles';
import {CurrencyInput} from './CurrencyInput';
import {Formik} from 'formik';
import {applyStyles} from '@/styles';

type Payload = {
  amount: number | undefined;
  method: string;
};

type Props = {
  isLoading: boolean;
  onSubmit(data: Payload, callback: () => void): void;
};

export const CreditPaymentForm = (props: Props) => {
  const {isLoading, onSubmit} = props;

  const onFormSubmit = useCallback(
    (values, {resetForm}) => {
      onSubmit(values, resetForm);
    },
    [onSubmit],
  );

  return (
    <View>
      <Formik
        onSubmit={onFormSubmit}
        initialValues={{amount: 0, method: 'cash'}}>
        {({values, errors, touched, setFieldValue, handleSubmit}) => (
          <>
            <View style={applyStyles('flex-row', 'items-center')}>
              <CurrencyInput
                label="Amount Paid"
                keyboardType="number-pad"
                containerStyle={styles.input}
                value={values.amount}
                isInvalid={touched.amount && !!errors.amount}
                onChangeText={(text) => setFieldValue('amount', text)}
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
                selectedValue={values.method}
                onValueChange={(itemValue) =>
                  setFieldValue('method', itemValue)
                }>
                <Picker.Item label="Cash" value="cash" />
                <Picker.Item label="Bank Transfer" value="transfer" />
                <Picker.Item label="Mobile Money" value="mobile" />
              </Picker>
              {!!errors.method && (
                <Text
                  style={applyStyles('text-500 pt-xs', {
                    fontSize: 14,
                    color: colors['red-200'],
                  })}>
                  {errors.method}
                </Text>
              )}
            </View>

            <Button
              isLoading={isLoading}
              onPress={handleSubmit}
              title="Confirm payment"
              disabled={!values.amount}
              style={applyStyles({marginBottom: 40})}
            />
          </>
        )}
      </Formik>
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
