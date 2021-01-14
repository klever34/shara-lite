import {Button, SecureEmblem} from '@/components';
import {Icon} from '@/components/Icon';
import {ToastContext} from '@/components/Toast';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {IPaymentOption} from '@/models/PaymentOption';
import {
  getAnalyticsService,
  getApiService,
  getAuthService,
  getStorageService,
} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {usePaymentOption} from '@/services/payment-option';
import {applyStyles, colors} from '@/styles';
import {omit} from 'lodash';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Alert, FlatList, Text, View} from 'react-native';
import {PaymentProvider} from 'types/app';
import {PaymentForm} from './PaymentForm';
import {PaymentPreviewModal} from './PaymentPreviewModal';
//@ts-ignore
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import {Page} from '@/components/Page';
import Config from 'react-native-config';
import Clipboard from '@react-native-community/clipboard';
import {getI18nService} from '@/services';
const strings = getI18nService().strings;

function PaymentContainer(props: ModalWrapperFields) {
  const {openModal} = props;
  const apiService = getApiService();
  const navigation = useAppNavigation();
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
  const [user, setUser] = useState(getAuthService().getUser());
  const [business, setBusiness] = useState(getAuthService().getBusinessInfo());

  const {showSuccessToast} = useContext(ToastContext);
  const paymentLink = `${Config.WEB_BASE_URL}/pay/${business.slug}`;

  const copyToClipboard = useCallback(() => {
    Clipboard.setString(paymentLink);
    showSuccessToast(strings('payment.copied'));
    getAnalyticsService()
      .logEvent('copiedPaymentLink', {})
      .then(() => {});
  }, [paymentLink, showSuccessToast]);

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
        showSuccessToast(strings('payment.payment_container.payment_added'));
        setIsSaving(false);
      } else {
        Alert.alert(
          strings('warning'),
          strings('payment.payment_container.warning_message'),
        );
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
        showSuccessToast(strings('payment.payment_container.payment_edited'));
        setIsSaving(false);
      } else {
        Alert.alert(
          strings('warning'),
          strings('payment.payment_container.warning_message'),
        );
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
        <View style={applyStyles('py-24')}>
          <Text
            style={applyStyles(
              'text-center text-uppercase text-700 text-gray-300 mb-16',
            )}>
            {strings('payment.payment_container.add_payment_info')}
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
                  title={strings('cancel')}
                  onPress={closeModal}
                  variantColor="transparent"
                  style={applyStyles({width: '48%'})}
                />
                <Button
                  title={strings('save')}
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
        </View>
      ),
    });
  }, [openModal, isSaving, onFormSubmit, paymentProviders]);

  const handleOpenEditItemModal = useCallback(
    (item: IPaymentOption) => {
      const initialValues = omit(item);
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <View style={applyStyles('py-20')}>
            <Text
              style={applyStyles(
                'text-center text-uppercase text-700 text-gray-300',
              )}>
              {strings('payment.payment_container.edit_payment_info')}
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
                    title={strings('remove')}
                    isLoading={isDeleting}
                    style={applyStyles({width: '48%'})}
                    onPress={() => {
                      Alert.alert(
                        strings('warning'),
                        strings('payment.payment_container.remove_message'),
                        [
                          {
                            text: strings('no'),
                            onPress: () => {},
                          },
                          {
                            text: strings('yes'),
                            onPress: () => {
                              handleRemoveItem(item);
                              closeModal();
                            },
                          },
                        ],
                      );
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
          </View>
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
        <PaymentPreviewModal
          onClose={closePreviewModal}
          paymentOptions={paymentOptions}
        />
      ),
    });
  }, [openModal, paymentOptions]);

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
    <Page
      header={{
        title: strings('payment.payment_container.payment_settings'),
        iconLeft: {},
        style: applyStyles('py-8'),
      }}
      style={applyStyles('px-0')}>
      <KeyboardAwareScrollView
        nestedScrollEnabled
        persistentScrollbar={true}
        keyboardShouldPersistTaps="always"
        style={applyStyles('py-18 bg-white flex-1')}>
        {paymentOptions.length === 0 ? (
          <View style={applyStyles('flex-1')}>
            <View style={applyStyles('center pb-32')}>
              <SecureEmblem />
              <Text
                style={applyStyles(
                  'text-center text-gray-200 text-base pt-16 px-8',
                )}>
                {strings(
                  'payment.payment_container.no_payment_option.description',
                )}
              </Text>
            </View>
            <PaymentForm
              onFormSubmit={onFormSubmit}
              paymentProviders={paymentProviders}
              renderButtons={(handleSubmit, values) => (
                <View style={applyStyles('pt-24', {paddingBottom: 300})}>
                  <Button
                    title={strings('save')}
                    isLoading={isSaving}
                    onPress={handleSubmit}
                    disabled={!values?.slug}
                  />
                </View>
              )}
            />
          </View>
        ) : (
          <View style={applyStyles('flex-1')}>
            <View style={applyStyles('center')}>
              <Touchable onPress={copyToClipboard}>
                <View style={applyStyles('flex-row px-32 mb-24')}>
                  <Text
                    style={applyStyles('text-400 leading-16 flex-1', {
                      color: colors['red-200'],
                      textDecorationLine: 'underline',
                    })}>
                    {paymentLink}
                  </Text>

                  <View style={applyStyles('flex-row items-center')}>
                    <Icon
                      size={18}
                      name="copy"
                      type="feathericons"
                      color={colors['gray-50']}
                    />
                    <Text
                      style={applyStyles(
                        'text-gray-200 text-400 text-xxs pl-4',
                      )}>
                      {strings('payment.payment_container.copy_payment_link')}
                    </Text>
                  </View>
                </View>
              </Touchable>
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
                  <Text style={applyStyles('pl-4 text-400 text-gray-200')}>
                    {strings('payment.payment_container.preview_payment_page')}
                  </Text>
                </View>
              </Touchable>
            </View>

            <View style={applyStyles('p-16')}>
              <Button
                title={strings('payment.payment_container.add_new_payment')}
                onPress={handleOpenAddItemModal}
              />
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
      </KeyboardAwareScrollView>
    </Page>
  );
}

export default withModal(PaymentContainer);
