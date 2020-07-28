import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {Button, FloatingLabelInput, CurrencyInput} from '../../../components';
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

  const handleAmountChange = useCallback((value: number) => {
    setAmount(value.toString());
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
    const payload = {amount: parseFloat(amount), note, method: type};
    onSubmit && onSubmit(payload);
    handleClose();
  }, [onSubmit, amount, note, type, handleClose]);

  return (
    <Modal
      isVisible={visible}
      onSwipeComplete={handleClose}
      style={applyStyles({
        margin: 0,
        justifyContent: 'flex-end',
      })}>
      <View
        style={applyStyles({
          backgroundColor: colors.white,
        })}>
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

        <View style={applyStyles('px-lg')}>
          <View style={applyStyles('mb-md')}>
            <CurrencyInput
              value={amount}
              label="Amount Paid"
              keyboardType="numeric"
              onChange={handleAmountChange}
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
