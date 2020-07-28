import React, {useEffect, useState, useCallback} from 'react';
import {Modal, View, ScrollView, Text, StyleSheet} from 'react-native';
import {applyStyles} from '../../../helpers/utils';
import {colors} from '../../../styles';
import Icon from '../../../components/Icon';
import {FloatingLabelInput, Button} from '../../../components';

type Props = {
  visible: boolean;
  customer: Customer;
  onClose: () => void;
  onOpenContactList: () => void;
  onSelectCustomer: (customer: Customer) => void;
  onUpdateCustomer: (text: string, key: string) => void;
};

export const CustomerDetailsModal = (props: Props) => {
  const {
    visible,
    onClose,
    onSelectCustomer,
    onOpenContactList,
    customer: customerProps,
  } = props;

  const [customer, setCustomer] = useState(customerProps);

  useEffect(() => {
    setCustomer(customerProps);
    onSelectCustomer(customerProps);
  }, [customerProps, onSelectCustomer]);

  const handleDone = () => {
    onSelectCustomer(customer);
    onClose();
  };

  const handleCustomerChange = useCallback(
    (value, key) => {
      setCustomer({...customer, [key]: value});
    },
    [customer],
  );

  return (
    <Modal transparent={false} animationType="slide" visible={visible}>
      <ScrollView style={applyStyles('px-lg', {paddingVertical: 48})}>
        <View style={applyStyles({marginBottom: 48})}>
          <Button style={applyStyles('mb-lg')} onPress={onOpenContactList}>
            <View
              style={applyStyles('flex-row', 'items-center', 'justify-center')}>
              <Icon
                size={24}
                name="user"
                type="feathericons"
                color={colors.white}
              />
              <Text
                style={applyStyles('text-400', 'pl-md', 'text-uppercase', {
                  color: colors.white,
                })}>
                Select customer
              </Text>
            </View>
          </Button>

          <Text
            style={applyStyles('mb-xl', 'text-center', 'text-400', {
              color: colors['gray-100'],
            })}>
            Or enter customer details below
          </Text>
        </View>
        <View>
          <Text
            style={applyStyles('pb-sm', 'text-400', {
              fontSize: 18,
              color: colors.primary,
            })}>
            Customer Details
          </Text>
          <FloatingLabelInput
            label="Phone number"
            value={customer.mobile}
            keyboardType="number-pad"
            containerStyle={applyStyles('pb-xl')}
            onChangeText={(text) => handleCustomerChange(text, 'mobile')}
          />
          <FloatingLabelInput
            value={customer.name}
            label="Type Customer Name"
            containerStyle={applyStyles({paddingBottom: 80})}
            onChangeText={(text) => handleCustomerChange(text, 'name')}
          />
        </View>
      </ScrollView>
      <View style={styles.actionButtons}>
        <Button
          variantColor="clear"
          style={styles.actionButton}
          onPress={onClose}>
          <Text
            style={applyStyles('text-400', 'text-uppercase', {
              color: colors['gray-200'],
            })}>
            Cancel
          </Text>
        </Button>
        <Button
          title="Done"
          variantColor="red"
          onPress={handleDone}
          style={styles.actionButton}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderTopColor: colors['gray-20'],
  },
  actionButton: {
    width: '48%',
  },
});
