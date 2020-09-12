import {Button, PaymentMethodSelect} from '@/components';
import Icon from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {applyStyles} from '@/helpers/utils';
import BottomHalfModal from '@/modals/BottomHalfModal';
import {colors} from '@/styles';
import {format} from 'date-fns/esm';
import React, {useCallback, useState} from 'react';
import {Text, View} from 'react-native';

type Props = {
  visible: boolean;
  closeModal: () => void;
};

export const CreateReceiptModal = (props: Props) => {
  const {visible, closeModal} = props;

  const [paymentMethod, setPaymentMethod] = useState<string[]>([]);

  const handlePaymentMethodChange = useCallback((value: string[]) => {
    setPaymentMethod(value);
  }, []);

  const renderContent = useCallback(
    ({closeModal: close}) => {
      return (
        <View>
          <Touchable onPress={close}>
            <View
              style={applyStyles({
                right: 0,
                top: -40,
                width: 48,
                height: 48,
                position: 'absolute',
              })}>
              <Icon
                size={24}
                name="x"
                color={colors.white}
                type="feathericons"
              />
            </View>
          </Touchable>
          <View
            style={applyStyles({
              paddingTop: 18,
              paddingBottom: 32,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              backgroundColor: colors.white,
            })}>
            <View style={applyStyles('px-lg')}>
              <View
                style={applyStyles('flex-row items-center', {
                  paddingBottom: 32,
                })}>
                <View style={applyStyles({width: '48%'})}>
                  <Text style={applyStyles('text-700 text-uppercase')}>
                    Create a receipt
                  </Text>
                </View>
                <View style={applyStyles('items-end', {width: '48%'})}>
                  <Touchable>
                    <View style={applyStyles('flex-row items-center')}>
                      <Icon
                        size={24}
                        name="camera"
                        type="feathericons"
                        color={colors.primary}
                      />
                      <Text
                        style={applyStyles('pl-sm text-400 text-uppercase', {
                          color: colors.primary,
                        })}>
                        Snap receipt
                      </Text>
                    </View>
                  </Touchable>
                </View>
              </View>

              <View style={applyStyles({paddingBottom: 32})}>
                <Touchable>
                  <View style={applyStyles('pb-sm flex-row items-center')}>
                    <Text style={applyStyles('text-400')}>Receipt for:</Text>
                    <Text
                      style={applyStyles('text-400 pl-sm', {
                        color: colors.primary,
                      })}>
                      Add Customer Details
                    </Text>
                  </View>
                </Touchable>
                <View style={applyStyles('pb-sm')}>
                  <Text style={applyStyles('text-400')}>
                    Date: {format(new Date(), 'dd/MM/yyyy, hh:mm:a')}
                  </Text>
                </View>
                <View style={applyStyles('pb-sm')}>
                  <Text style={applyStyles('text-400')}>No.: SH0078912</Text>
                </View>
              </View>

              <View style={applyStyles({paddingBottom: 32})}>
                <View style={applyStyles('flex-row items-center')}>
                  <Text style={applyStyles('text-400')}>Paid with:</Text>
                  <View style={applyStyles('ml-sm')}>
                    <PaymentMethodSelect
                      value={paymentMethod}
                      onChange={handlePaymentMethodChange}
                    />
                  </View>
                </View>
              </View>

              <Button onPress={() => {}} title="create" variantColor="red" />
            </View>
          </View>
        </View>
      );
    },
    [paymentMethod, handlePaymentMethodChange],
  );

  return (
    <BottomHalfModal
      visible={visible}
      closeModal={closeModal}
      renderContent={renderContent}
    />
  );
};
