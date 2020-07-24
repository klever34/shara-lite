import React, {useEffect, useState, useCallback} from 'react';
import {Modal, View, Text, StyleSheet} from 'react-native';
import {Button, FloatingLabelInput} from '../../../components';
import {colors} from '../../../styles';
import {applyStyles} from '../../../helpers/utils';

type Props = {
  amount: number;
  visible: boolean;
  onClose: () => void;
  type: 'cash' | 'transfer' | 'mobile';
  onSubmit: (payment: Payment) => void;
};

export const PaymentMethodModal = (props: Props) => {
  const {
    visible,
    onClose,
    onSubmit,
    type = 'cash',
    amount: totalAmount,
  } = props;
  const modalTitle = {
    cash: 'Cash Payment',
    transfer: 'Bank Transfer',
    mobile: 'Mobile Money',
  };
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState(totalAmount.toString() || '');

  useEffect(() => {
    setAmount(totalAmount.toString());
  }, [totalAmount]);

  const handleAmountChange = useCallback((value: string) => {
    setAmount(value);
  }, []);

  const handleNoteChange = useCallback((value: string) => {
    setNote(value);
  }, []);

  const handleClose = useCallback(() => {
    setNote('');
    setAmount('');
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    const payload = {amount: parseFloat(amount), note, paymentMethod: type};
    onSubmit && onSubmit(payload);
    setAmount;
    handleClose();
  }, [onSubmit, amount, note, type, handleClose]);

  return (
    <Modal animationType="slide" visible={visible}>
      <View
        style={applyStyles('items-center', 'justify-center', 'py-lg', {
          borderBottomWidth: 1,
          borderBottomColor: colors['gray-20'],
        })}>
        <Text
          style={applyStyles('text-500', 'text-uppercase', {
            color: colors.primary,
          })}>
          {modalTitle[type]}
        </Text>
      </View>

      <View style={applyStyles('flex-1', 'px-lg')}>
        <View style={applyStyles('mb-md')}>
          <FloatingLabelInput
            value={amount}
            label="Amount Paid"
            keyboardType="numeric"
            onChangeText={handleAmountChange}
            leftIcon={
              <Text style={applyStyles(styles.textInputIconText, 'text-400')}>
                &#8358;
              </Text>
            }
          />
        </View>

        <View style={applyStyles('mb-md')}>
          <FloatingLabelInput
            multiline
            value={note}
            label="Note (optional)"
            onChangeText={handleNoteChange}
          />
        </View>
      </View>
      <View style={styles.actionButtons}>
        <Button
          title="Cancel"
          variantColor="clear"
          onPress={handleClose}
          style={styles.actionButton}
        />
        <Button
          title="Done"
          variantColor="red"
          onPress={handleSubmit}
          style={styles.actionButton}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
  },
  textInputIconText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
});
