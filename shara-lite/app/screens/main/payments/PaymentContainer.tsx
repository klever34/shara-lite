import {Button, Header, SecureEmblem} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {IPaymentOption} from '@/models/PaymentOption';
import {
  getAnalyticsService,
  getApiService,
  getAuthService,
  getStorageService,
} from '@/services';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {useAppNavigation} from '@/services/navigation';
import {usePaymentOption} from '@/services/payment-option';
import {applyStyles, colors} from '@/styles';
import {omit} from 'lodash';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Alert, FlatList, Image, ScrollView, Text, View} from 'react-native';
import {PaymentProvider} from 'types/app';
import {ToastContext} from '@/components/Toast';
import {PaymentForm} from './PaymentForm';
import {PaymentPreviewItem} from './PaymentPreviewItem';

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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [business, setBusiness] = useState(getAuthService().getBusinessInfo());
  const [user, setUser] = useState(getAuthService().getUser());

  const {showSuccessToast} = useContext(ToastContext);

  const getMobileNumber = useCallback(() => {
    const code = business.country_code || callingCode;
    if (business.mobile?.startsWith(code)) {
      return `+${code}${business.mobile.replace(code, '')}`;
    }
    return `+${code}${business.mobile}`;
  }, [business.country_code, business.mobile, callingCode]);

  const onFormSubmit = useCallback(
    async (values: IPaymentOption) => {
      if (
        values?.fieldsData
          ?.filter((item) => item.required)
          .every((item) => item.value)
      ) {
        setIsSaving(true);
        await savePaymentOption({paymentOption: values});
        getAnalyticsService()
          .logEvent('paymentOptionAdded', {})
          .then(() => {});
        showSuccessToast('PAYMENT OPTION ADDED');
        setIsSaving(false);
      } else {
        Alert.alert('Warning', 'Please fill all the fields in the form');
      }
    },
    [savePaymentOption, showSuccessToast],
  );

  const handleEditItem = useCallback(
    async (paymentOption: IPaymentOption, updates: Partial<IPaymentOption>) => {
      if (
        updates?.fieldsData
          ?.filter((item) => item.required)
          .every((item) => item.value)
      ) {
        delete updates.fields;
        setIsSaving(true);
        await updatePaymentOption({paymentOption, updates});
        getAnalyticsService()
          .logEvent('paymentOptionEdited', {})
          .then(() => {});
        showSuccessToast('PAYMENT OPTION EDITED');
        setIsSaving(false);
      } else {
        Alert.alert('Warning', 'Please fill all the fields in the form');
      }
    },
    [updatePaymentOption, showSuccessToast],
  );

  const handleRemoveItem = useCallback(
    async (values) => {
      setIsDeleting(true);
      await deletePaymentOption({paymentOption: values});
      getAnalyticsService()
        .logEvent('paymentOptionRemoved', {})
        .then(() => {});
      showSuccessToast('PAYMENT OPTION REMOVED');
      setIsDeleting(false);
    },
    [deletePaymentOption, showSuccessToast],
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
          <PaymentForm
            onFormSubmit={onFormSubmit}
            paymentProviders={paymentProviders}
            renderButtons={(handleSubmit) => (
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
                  isLoading={isSaving}
                  style={applyStyles({width: '48%'})}
                  onPress={() => {
                    handleSubmit();
                    closeModal();
                  }}
                />
              </View>
            )}
          />
        </>
      ),
    });
  }, [openModal, isSaving, onFormSubmit, paymentProviders]);

  const handleOpenEditItemModal = useCallback(
    (item: IPaymentOption) => {
      const initialValues = omit(item);
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <>
            <Text
              style={applyStyles(
                'text-center text-uppercase text-700 text-gray-300',
              )}>
              edit Payment info
            </Text>
            <PaymentForm
              hidePicker={true}
              paymentProviders={paymentProviders}
              onFormSubmit={(values) => handleEditItem(item, values)}
              initialValues={{
                ...initialValues,
                fieldsData: initialValues.fields
                  ? JSON.parse(initialValues.fields)
                  : [],
              }}
              renderButtons={(handleSubmit) => (
                <View
                  style={applyStyles(
                    'pt-24 flex-row items-center justify-between',
                  )}>
                  <Button
                    title="Remove"
                    isLoading={isDeleting}
                    style={applyStyles({width: '48%'})}
                    onPress={() => {
                      handleRemoveItem(item);
                      closeModal();
                    }}
                    variantColor="transparent"
                  />
                  <Button
                    title="Save"
                    isLoading={isSaving}
                    style={applyStyles({width: '48%'})}
                    onPress={() => {
                      handleSubmit();
                      closeModal();
                    }}
                  />
                </View>
              )}
            />
          </>
        ),
      });
    },
    [
      openModal,
      isSaving,
      isDeleting,
      handleEditItem,
      handleRemoveItem,
      paymentProviders,
    ],
  );

  const handleOpenPreviewModal = useCallback(() => {
    getAnalyticsService()
      .logEvent('previewPaymentInfo', {})
      .then(() => {});
    const closePreviewModal = openModal('full', {
      renderContent: () => (
        <>
          <Header
            title="Your Payment Page Preview"
            iconLeft={{iconName: 'x', onPress: closePreviewModal}}
          />
          <View style={applyStyles('flex-1 bg-gray-10 px-16 h-screen')}>
            <View style={applyStyles('flex-row justify-between items-center')}>
              <Image
                resizeMode="contain"
                style={applyStyles('w-80 h-80')}
                source={require('@/assets/images/shara_logo_red.png')}
              />
              <SecureEmblem style={applyStyles({width: 48, height: 48})} />
            </View>
            <ScrollView
              persistentScrollbar
              keyboardShouldPersistTaps="always"
              style={applyStyles('bg-white rounded-16 flex-1')}>
              <View style={applyStyles('bg-white rounded-16 p-16')}>
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
                          'text-400 text-sm leading-16 text-gray-300 mb-4',
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
                    style={applyStyles(
                      'text-gray-300 text-700 text-center py-24',
                    )}>
                    You can pay me via
                  </Text>
                  {paymentOptions.map((item, index) => (
                    <PaymentPreviewItem
                      item={item}
                      key={`${item.name}-${index}`}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
          <View style={applyStyles('items-center py-32 bg-gray-10')}>
            <Text style={applyStyles('text-center text-gray-100 text-sm')}>
              Powered by Shara Inc © 2020
            </Text>
            <Text style={applyStyles('text-center text-gray-100 text-sm')}>
              www.shara.co
            </Text>
          </View>
        </>
      ),
    });
  }, [
    business.address,
    business.mobile,
    business.name,
    business.profile_image,
    getMobileNumber,
    openModal,
    paymentOptions,
  ]);

  const fectchPaymentProviders = useCallback(async () => {
    const savedProviders = (await getStorageService().getItem(
      'providers',
    )) as PaymentProvider[];

    try {
      const country_code = business.country_code || user?.country_code;
      const providers = await apiService.getPaymentProviders({
        country_code,
      });
      await getStorageService().setItem('providers', JSON.stringify(providers));
      setPaymentProviders(providers);
    } catch (error) {
      setPaymentProviders(savedProviders ?? []);
    }
  }, [apiService, business, user]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      setBusiness(getAuthService().getBusinessInfo());
      setUser(getAuthService().getUser());
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
        <View style={applyStyles('flex-1')}>
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
          <PaymentForm
            onFormSubmit={onFormSubmit}
            paymentProviders={paymentProviders}
            renderButtons={(handleSubmit, values) => (
              <View style={applyStyles('pt-24', {paddingBottom: 300})}>
                <Button
                  title="Save"
                  isLoading={isSaving}
                  onPress={handleSubmit}
                  disabled={!values?.slug}
                />
              </View>
            )}
          />
        </View>
      ) : (
        <View>
          <View style={applyStyles('center')}>
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

          <View style={applyStyles('p-16')}>
            <Button title="Add New Payment" onPress={handleOpenAddItemModal} />
          </View>
          <FlatList
            data={paymentOptions}
            style={applyStyles('pb-56')}
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
        </View>
      )}
    </ScrollView>
  );
}

export default withModal(PaymentContainer);