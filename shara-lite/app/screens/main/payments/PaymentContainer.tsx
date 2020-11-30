import {AppInput, Button, SecureEmblem} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {applyStyles, colors} from '@/styles';
import {Picker} from '@react-native-community/picker';
import {Formik} from 'formik';
import React, {useCallback, useState} from 'react';
import {FlatList, Image, ScrollView, Text, View} from 'react-native';

type PaymentMethod = {
  id: string;
  number: string;
  method: string;
};

const pickerLabelString = {
  mpesa: 'MPESA',
  bank: 'Bank',
} as {[key: string]: string};

function PaymentContainer(props: ModalWrapperFields) {
  const {openModal} = props;
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const onFormSubmit = useCallback(
    (values) => {
      setPaymentMethods([{id: Date.now(), ...values}, ...paymentMethods]);
    },
    [paymentMethods],
  );

  const handleEditItem = useCallback(
    (values) => {
      const updatedList = paymentMethods.map((item) => {
        if (item.id === values.id) {
          return values;
        }
        return item;
      });
      setPaymentMethods(updatedList);
    },
    [paymentMethods],
  );

  const handleRemoveItem = useCallback(
    (values) => {
      setPaymentMethods(paymentMethods.filter((item) => item.id !== values.id));
    },
    [paymentMethods],
  );

  const handleOpenAddItemModal = useCallback(() => {
    const closeModal = openModal('bottom-half', {
      renderContent: () => (
        <>
          <Text
            style={applyStyles(
              'text-center text-uppercase text-700 text-gray-300',
            )}>
            add Payment info
          </Text>
          <Formik
            onSubmit={onFormSubmit}
            initialValues={{method: 'mpesa', number: ''}}>
            {({values, handleChange, setFieldValue, handleSubmit}) => (
              <View style={applyStyles('px-16 py-24')}>
                <Picker
                  mode="dropdown"
                  prompt="Select a payment method"
                  selectedValue={values.method}
                  onValueChange={(itemValue) =>
                    setFieldValue('method', itemValue)
                  }
                  style={applyStyles('bg-gray-10 py-16 pl-16 rounded-12')}>
                  <Picker.Item label="MPESA" value="mpesa" />
                  <Picker.Item label="Bank" value="bank" />
                </Picker>

                <AppInput
                  value={values.number}
                  keyboardType="numeric"
                  style={applyStyles('mt-24')}
                  onChangeText={handleChange('number')}
                  placeholder={`${pickerLabelString[values.method]} Number`}
                />

                <View
                  style={applyStyles(
                    'pt-24 flex-row items-center justify-between',
                  )}>
                  <Button
                    title="Cancel"
                    onPress={closeModal}
                    variantColor="transparent"
                    style={applyStyles({width: '48%'})}
                  />
                  <Button
                    title="Save"
                    style={applyStyles({width: '48%'})}
                    onPress={() => {
                      handleSubmit();
                      closeModal();
                    }}
                  />
                </View>
              </View>
            )}
          </Formik>
        </>
      ),
    });
  }, [openModal, onFormSubmit]);

  const handleOpenEditItemModal = useCallback(
    (item: PaymentMethod) => {
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <>
            <Text
              style={applyStyles(
                'text-center text-uppercase text-700 text-gray-300',
              )}>
              edit Payment info
            </Text>
            <Formik onSubmit={handleEditItem} initialValues={item}>
              {({values, handleChange, setFieldValue, handleSubmit}) => (
                <View style={applyStyles('px-16 py-24')}>
                  <Picker
                    mode="dropdown"
                    prompt="Select a payment method"
                    selectedValue={values.method}
                    onValueChange={(itemValue) =>
                      setFieldValue('method', itemValue)
                    }
                    style={applyStyles('bg-gray-10 py-16 pl-16 rounded-12')}>
                    <Picker.Item label="MPESA" value="mpesa" />
                    <Picker.Item label="Bank" value="bank" />
                  </Picker>

                  <AppInput
                    value={values.number}
                    keyboardType="numeric"
                    style={applyStyles('mt-24')}
                    onChangeText={handleChange('number')}
                    placeholder={`${pickerLabelString[values.method]} Number`}
                  />

                  <View
                    style={applyStyles(
                      'pt-24 flex-row items-center justify-between',
                    )}>
                    <Button
                      title="Remove"
                      style={applyStyles({width: '48%'})}
                      onPress={() => {
                        handleRemoveItem(item);
                        closeModal();
                      }}
                      variantColor="transparent"
                    />
                    <Button
                      title="Save"
                      style={applyStyles({width: '48%'})}
                      onPress={() => {
                        handleSubmit();
                        closeModal();
                      }}
                    />
                  </View>
                </View>
              )}
            </Formik>
          </>
        ),
      });
    },
    [openModal, handleEditItem, handleRemoveItem],
  );

  const handleOpenPreviewModal = useCallback(() => {
    openModal('full', {
      renderContent: () => (
        <View style={applyStyles('flex-1 bg-gray-10 px-16')}>
          <View style={applyStyles('flex-row justify-between')}>
            <Image
              resizeMode="contain"
              style={applyStyles('w-80 h-80')}
              source={require('@/assets/images/shara_logo_red.png')}
            />
            <SecureEmblem />
          </View>
        </View>
      ),
    });
  }, [openModal]);

  return (
    <ScrollView
      persistentScrollbar
      keyboardShouldPersistTaps="always"
      style={applyStyles('py-16 bg-white flex-1')}>
      {paymentMethods.length === 0 ? (
        <View style={applyStyles('px-16')}>
          <View style={applyStyles('center pb-32')}>
            <SecureEmblem />
            <Text
              style={applyStyles(
                'text-center text-gray-200 text-base pt-16 px-8',
              )}>
              Add your preferred methods of collecting payment so your customers
              can know how to pay you.
            </Text>
          </View>
          <Formik
            onSubmit={onFormSubmit}
            initialValues={{method: '', number: ''}}>
            {({values, handleChange, setFieldValue, handleSubmit}) => (
              <>
                <Picker
                  mode="dropdown"
                  prompt="Select a payment method"
                  selectedValue={values.method}
                  onValueChange={(itemValue) =>
                    setFieldValue('method', itemValue)
                  }
                  style={applyStyles('bg-gray-10 py-16 pl-16 rounded-12')}>
                  <Picker.Item label="MPESA" value="mpesa" />
                  <Picker.Item label="Bank" value="bank" />
                </Picker>

                {!!values.method && (
                  <AppInput
                    value={values.number}
                    keyboardType="numeric"
                    style={applyStyles('mt-24')}
                    onChangeText={handleChange('number')}
                    placeholder={`${pickerLabelString[values.method]} Number`}
                  />
                )}

                <View style={applyStyles('pt-24')}>
                  <Button
                    title="Save"
                    disabled={!values.method}
                    onPress={handleSubmit}
                  />
                </View>
              </>
            )}
          </Formik>
        </View>
      ) : (
        <View>
          <FlatList
            data={paymentMethods}
            renderItem={({item}) => (
              <View
                style={applyStyles(
                  'flex-row items-center py-8 px-16 bg-white justify-between',
                  {
                    borderTopColor: colors['gray-10'],
                    borderTopWidth: 1,
                    borderBottomColor: colors['gray-10'],
                    borderBottomWidth: 1,
                  },
                )}>
                <View style={applyStyles('py-8')}>
                  <Text style={applyStyles('text-gray-300 text-700 text-base')}>
                    {item.number}
                  </Text>
                  <Text style={applyStyles('text-gray-100 text-uppercase')}>
                    {pickerLabelString[item.method]}
                  </Text>
                </View>
                <View>
                  <Touchable onPress={() => handleOpenEditItemModal(item)}>
                    <View style={applyStyles('px-16 py-8')}>
                      <Icon
                        size={20}
                        name="edit"
                        type="feathericons"
                        color={colors['gray-50']}
                      />
                    </View>
                  </Touchable>
                </View>
              </View>
            )}
            keyExtractor={(item, index) => `${item.number}-${index}`}
          />

          <View style={applyStyles('center pt-24')}>
            <Touchable onPress={handleOpenPreviewModal}>
              <View
                style={applyStyles(
                  'py-8 px-16 rounded-8 flex-row items-center bg-gray-20',
                )}>
                <Icon
                  name="eye"
                  size={16}
                  type="feathericons"
                  color={colors['gray-50']}
                />
                <Text
                  style={applyStyles(
                    'pl-4 text-700 text-gray-200 text-uppercase',
                  )}>
                  Preview your payment page
                </Text>
              </View>
            </Touchable>
          </View>

          <View style={applyStyles('pt-24 px-16')}>
            <Button title="Add New Payment" onPress={handleOpenAddItemModal} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

export default withModal(PaymentContainer);
