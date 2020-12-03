import {AppInput, Button, SecureEmblem} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {IPaymentOption} from '@/models/PaymentOption';
import {getApiService, getAuthService} from '@/services';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {useAppNavigation} from '@/services/navigation';
import {usePaymentOption} from '@/services/payment-option';
import {applyStyles, colors} from '@/styles';
import {Picker} from '@react-native-community/picker';
import {Formik} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Image, ScrollView, Text, View} from 'react-native';
import {PaymentProvider} from 'types/app';

function PaymentContainer(props: ModalWrapperFields) {
  const {openModal} = props;
  const apiService = getApiService();
  const navigation = useAppNavigation();
  const {callingCode} = useIPGeolocation();
  const {
    savePaymentOption,
    getPaymentOptions,
    updatePaymentOption,
    deletePaymentOption,
  } = usePaymentOption();
  const paymentOptions = getPaymentOptions();
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>(
    [],
  );
  const [business, setBusiness] = useState(getAuthService().getBusinessInfo());

  const getMobileNumber = useCallback(() => {
    const code = business.country_code || callingCode;
    if (business.mobile?.startsWith(code)) {
      return `+${code}${business.mobile.replace(code, '')}`;
    }
    return `+${code}${business.mobile}`;
  }, [business.country_code, business.mobile, callingCode]);

  const onFormSubmit = useCallback(
    (values) => {
      console.log(values);
      savePaymentOption({paymentOption: values});
    },
    [savePaymentOption],
  );

  const handleEditItem = useCallback(
    (items, values) => {
      updatePaymentOption({paymentOption: items, updates: values});
    },
    [updatePaymentOption],
  );

  const handleRemoveItem = useCallback(
    (values) => {
      deletePaymentOption({paymentOption: values});
    },
    [deletePaymentOption],
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
          <Formik<{
            name?: string;
            slug?: string;
            fieldsData?: Array<{key?: string; label?: string; value?: string}>;
          }>
            onSubmit={onFormSubmit}
            initialValues={{slug: ''}}>
            {({values, setFieldValue, handleSubmit}) => (
              <View style={applyStyles('px-16 py-24')}>
                <Picker
                  mode="dropdown"
                  prompt="Select a payment method"
                  selectedValue={values.slug}
                  onValueChange={(itemValue) => {
                    setFieldValue('slug', itemValue);
                    const selectedProvider = paymentProviders.find(
                      (item) => item.slug === itemValue,
                    );
                    const name = selectedProvider?.name;
                    const fields = selectedProvider?.fields;

                    setFieldValue('name', name);
                    setFieldValue('fieldsData', fields);
                  }}
                  style={applyStyles('bg-gray-10 py-16 pl-16 rounded-12')}>
                  <Picker.Item label="Select a payment method" value="" />
                  {paymentProviders.map((provider) => (
                    <Picker.Item
                      key={provider.slug}
                      label={provider.name}
                      value={provider.slug}
                    />
                  ))}
                </Picker>
                {values?.fieldsData?.map((field, index) => (
                  <AppInput
                    key={field.key}
                    keyboardType="numeric"
                    placeholder={field.label}
                    style={applyStyles('mt-24')}
                    value={
                      values?.fieldsData ? values?.fieldsData[index]?.value : ''
                    }
                    onChangeText={(text: string) => {
                      const updatedFieldsData = values?.fieldsData?.map(
                        (item) => {
                          if (item.key === field.key) {
                            return {...item, value: text};
                          }
                          return item;
                        },
                      );
                      setFieldValue('fieldsData', updatedFieldsData);
                    }}
                  />
                ))}

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
  }, [openModal, onFormSubmit, paymentProviders]);

  const handleOpenEditItemModal = useCallback(
    (item: IPaymentOption) => {
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <>
            <Text
              style={applyStyles(
                'text-center text-uppercase text-700 text-gray-300',
              )}>
              edit Payment info
            </Text>
            <Formik<{
              name?: string;
              slug?: string;
              fieldsData?: Array<{
                key?: string;
                label?: string;
                value?: string;
              }>;
            }>
              initialValues={item}
              onSubmit={(values) => handleEditItem(item, values)}>
              {({values, setFieldValue, handleSubmit}) => (
                <View style={applyStyles('px-16 py-24')}>
                  {values?.fieldsData?.map((field, index) => (
                    <AppInput
                      key={field.key}
                      keyboardType="numeric"
                      placeholder={field.label}
                      style={applyStyles('mt-24')}
                      value={
                        values?.fieldsData
                          ? values?.fieldsData[index]?.value
                          : ''
                      }
                      onChangeText={(text: string) => {
                        const updatedFieldsData = values?.fieldsData?.map(
                          (fieldData) => {
                            if (fieldData.key === field.key) {
                              return {...fieldData, value: text};
                            }
                            return fieldData;
                          },
                        );
                        setFieldValue('fieldsData', updatedFieldsData);
                      }}
                    />
                  ))}

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
        <View style={applyStyles('flex-1 bg-gray-10 px-16 mb-10')}>
          <View style={applyStyles('flex-row justify-between items-center')}>
            <Image
              resizeMode="contain"
              style={applyStyles('w-80 h-80')}
              source={require('@/assets/images/shara_logo_red.png')}
            />
            <SecureEmblem style={applyStyles({width: 48, height: 48})} />
          </View>
          <View style={applyStyles('bg-white rounded-16 p-16 mb-24')}>
            <View style={applyStyles('flex-row items-center')}>
              <View style={applyStyles('w-80 h-80')}>
                {business.profile_image && (
                  <Image
                    style={applyStyles('w-full h-full rounded-lg')}
                    source={{
                      uri: business.profile_image.url,
                    }}
                  />
                )}
              </View>
              <View style={applyStyles('flex-1 px-12')}>
                <Text
                  style={applyStyles(
                    'text-700 uppercase leading-16 text-gray-300 mb-4',
                  )}>
                  {business.name}
                </Text>
                <Text
                  style={applyStyles(
                    'text-400 text-sm leading-16 text-gray-300 mb-4',
                  )}>
                  {business.address}
                </Text>
                {!!business.mobile && (
                  <Text
                    style={applyStyles(
                      'text-400 text-sm leading-16  text-gray-300 mb-4',
                      {
                        color: colors['gray-300'],
                      },
                    )}>
                    Tel: {getMobileNumber()}
                  </Text>
                )}
              </View>
            </View>

            <View>
              <Text
                style={applyStyles('text-gray-300 text-700 text-center py-24')}>
                You can pay me via
              </Text>
              {/* {paymentOptions.map((item, index) => (
                <View
                  key={`${item.slug}-${index}`}
                  style={applyStyles(
                    'flex-row items-center py-8 bg-white justify-between',
                    {
                      borderTopColor: colors['gray-10'],
                      borderTopWidth: 1,
                      borderBottomColor: colors['gray-10'],
                      borderBottomWidth: 1,
                    },
                  )}>
                  <View style={applyStyles('py-8')}>
                    <Text
                      style={applyStyles(
                        'pb-4 text-gray-200 text-uppercase text-xs',
                      )}>
                      {pickerLabelString[item.method]}
                    </Text>
                    <Text style={applyStyles('text-gray-300 text-700 text-lg')}>
                      {item.number}
                    </Text>
                  </View>
                  <View>
                    <View
                      style={applyStyles(
                        'px-16 py-8 bg-gray-20 rounded-4 p-8',
                      )}>
                      <Text
                        style={applyStyles(
                          'text-uppercase text-400 text-gray-300 text-xs',
                        )}>
                        Copy number
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
             */}
            </View>
          </View>

          <View style={applyStyles('items-center flex-1')}>
            <Text style={applyStyles('text-center text-700 text-gray-300')}>
              CREATE RECEIPTS WITH SHARA FOR FREE. DOWNLOAD NOW.
            </Text>
          </View>
          <View style={applyStyles('items-center')}>
            <Text style={applyStyles('text-center text-gray-100 text-sm')}>
              Powered by Shara Inc © 2020
            </Text>
            <Text style={applyStyles('text-center text-gray-100 text-sm')}>
              www.shara.co
            </Text>
          </View>
        </View>
      ),
    });
  }, [
    business.address,
    business.mobile,
    business.name,
    business.profile_image,
    getMobileNumber,
    openModal,
  ]);

  const fectchPaymentProviders = useCallback(async () => {
    const providers = await apiService.getPaymentProviders();
    setPaymentProviders(providers);
  }, [apiService]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      setBusiness(getAuthService().getBusinessInfo());
    });
  }, [navigation]);

  useEffect(() => {
    fectchPaymentProviders();
  }, [fectchPaymentProviders]);

  return (
    <ScrollView
      persistentScrollbar
      keyboardShouldPersistTaps="always"
      style={applyStyles('py-24 bg-white flex-1')}>
      {paymentOptions.length === 0 ? (
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
          <Formik<{
            name?: string;
            slug?: string;
            fieldsData?: Array<{key?: string; label?: string; value?: string}>;
          }>
            onSubmit={onFormSubmit}
            initialValues={{slug: ''}}>
            {({values, setFieldValue, handleSubmit}) => (
              <>
                <Picker
                  mode="dropdown"
                  prompt="Select a payment method"
                  selectedValue={values.slug}
                  onValueChange={(itemValue) => {
                    setFieldValue('slug', itemValue);
                    const selectedProvider = paymentProviders.find(
                      (item) => item.slug === itemValue,
                    );
                    const name = selectedProvider?.name;
                    const fields = selectedProvider?.fields;

                    setFieldValue('name', name);
                    setFieldValue('fieldsData', fields);
                  }}
                  style={applyStyles('bg-gray-10 py-16 pl-16 rounded-12')}>
                  <Picker.Item label="Select a payment method" value="" />
                  {paymentProviders.map((provider) => (
                    <Picker.Item
                      key={provider.slug}
                      label={provider.name}
                      value={provider.slug}
                    />
                  ))}
                </Picker>
                {values?.fieldsData?.map((field, index) => (
                  <AppInput
                    key={field.key}
                    keyboardType="numeric"
                    placeholder={field.label}
                    style={applyStyles('mt-24')}
                    value={
                      values?.fieldsData ? values?.fieldsData[index]?.value : ''
                    }
                    onChangeText={(text: string) => {
                      const updatedFieldsData = values?.fieldsData?.map(
                        (item) => {
                          if (item.key === field.key) {
                            return {...item, value: text};
                          }
                          return item;
                        },
                      );
                      setFieldValue('fieldsData', updatedFieldsData);
                    }}
                  />
                ))}

                <View style={applyStyles('pt-24')}>
                  <Button
                    title="Save"
                    onPress={handleSubmit}
                    disabled={!values.slug}
                  />
                </View>
              </>
            )}
          </Formik>
        </View>
      ) : (
        <View>
          <FlatList
            data={paymentOptions}
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
                  <Text
                    style={applyStyles('pb-2 text-gray-100 text-uppercase')}>
                    {item.name}
                  </Text>
                  {item?.fieldsData?.map((i) => (
                    <Text
                      key={i.key}
                      style={applyStyles(
                        'pb-2 text-gray-300 text-700 text-base',
                      )}>
                      {i.label} - {i.value}
                    </Text>
                  ))}
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
            keyExtractor={(item, index) => `${item.slug}-${index}`}
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
