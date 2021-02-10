import {
  BusinessFormPayload,
  FormBuilder,
  FormFields,
  PhoneNumber,
} from '@/components';
import {Page} from '@/components/Page';
import {ToastContext} from '@/components/Toast';
import {TransactionReview} from '@/components/TransactionReview';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {IReceipt} from '@/models/Receipt';
import {
  getAnalyticsService,
  getApiService,
  getAuthService,
  getI18nService,
} from '@/services';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import {ObjectId} from 'bson';
import React, {useCallback, useContext, useMemo} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert, ScrollView, View} from 'react-native';

const i18Service = getI18nService();

export const BusinessSettings = withModal((props: ModalWrapperFields) => {
  const {openModal} = props;
  const handleError = useErrorHandler();
  const authService = getAuthService();
  const apiService = getApiService();
  let {callingCode} = useIPGeolocation();
  const navigation = useAppNavigation();
  const user = authService.getUser();
  const businessInfo = authService.getBusinessInfo();
  const {
    name,
    id,
    address,
    mobile = '',
    country_code,
    profile_image,
  } = businessInfo;
  callingCode = country_code || callingCode;
  const {showSuccessToast} = useContext(ToastContext);

  const dummyTransaction: IReceipt = {
    tax: 120,
    credit_amount: 0,
    amount_paid: 2500,
    total_amount: 5500,
    _id: new ObjectId(),
    is_collection: true,
    created_at: new Date(),
    transaction_date: new Date(),
    customer: {name: 'John Doe'},
  };

  const handleOpenPreviewReceiptModal = useCallback(() => {
    const closeModal = openModal('full', {
      renderContent: () => (
        <TransactionReview
          heading={i18Service.strings(
            'business_settings.receipt_preview.title',
          )}
          onDone={closeModal}
          showAnimation={false}
          showShareButtons={false}
          transaction={dummyTransaction}
          subheading={i18Service.strings(
            'business_settings.receipt_preview.description',
          )}
        />
      ),
    });
  }, [openModal, dummyTransaction]);

  const getMobileNumber = useCallback(() => {
    const mobileNumber = mobile || user?.mobile;
    if (mobileNumber) {
      if (mobileNumber?.startsWith(callingCode)) {
        return mobileNumber.replace(callingCode, '');
      }
      return mobileNumber;
    }
    return '';
  }, [user, mobile, callingCode]);

  const handleOpenSaveModal = useCallback(() => {
    const closeModal = openModal('full', {
      renderContent: () => (
        <ScrollView>
          <TransactionReview
            heading={i18Service.strings(
              'business_settings.receipt_preview.saved',
            )}
            showShareButtons={false}
            onDone={() => {
              closeModal();
              navigation.navigate('Settings');
            }}
            transaction={dummyTransaction}
            subheading={i18Service.strings(
              'business_settings.receipt_preview.description',
            )}
          />
          <View style={applyStyles('h-50')} />
        </ScrollView>
      ),
    });
  }, [openModal, navigation, dummyTransaction]);

  const formFields = useMemo(() => {
    const fields: FormFields<keyof Omit<BusinessFormPayload, 'countryCode'>> = {
      name: {
        type: 'text',
        props: {
          value: name,
          label: i18Service.strings('business_settings.fields.name.label'),
          rightIcon: 'home',
        },
      },
      mobile: {
        type: 'mobile',
        props: {
          value: {
            number: getMobileNumber(),
            callingCode: callingCode,
          },
          label: i18Service.strings('business_settings.fields.mobile.label'),
        },
      },
      address: {
        type: 'text',
        props: {
          value: address,
          label: i18Service.strings('business_settings.fields.address.label'),
          rightIcon: 'map-pin',
        },
      },
      profileImageFile: {
        type: 'image',
        props: {
          label: i18Service.strings('business_settings.fields.image.label'),
          placeholder: i18Service.strings(
            'business_settings.fields.image.placeholder',
          ),
          value: {uri: profile_image?.url ?? ''},
        },
      },
    };
    return fields;
  }, [address, callingCode, name, profile_image, getMobileNumber]);

  const handleSubmit = useCallback(
    async (formValues) => {
      const phoneNumber = formValues.mobile as PhoneNumber;
      formValues = {
        ...formValues,
        mobile: phoneNumber.number,
        countryCode: phoneNumber.callingCode,
      };
      const payload = new FormData();
      payload.append('name', formValues?.name);
      payload.append('address', formValues?.address);
      formValues?.mobile && payload.append('mobile', formValues?.mobile);
      formValues?.countryCode &&
        payload.append('country_code', formValues?.countryCode);
      formValues?.profileImageFile &&
        Object.keys(formValues?.profileImageFile).length > 1 &&
        payload.append('profileImageFile', formValues?.profileImageFile);
      try {
        user?.businesses && user.businesses.length
          ? await apiService.businessSetupUpdate(payload, id)
          : await apiService.businessSetup(payload);
        getAnalyticsService()
          .logEvent('businessSetupComplete', {})
          .catch(handleError);
        showSuccessToast(
          i18Service.strings('business_settings.edit_success_text'),
        );
        handleOpenSaveModal();
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    },
    [user, apiService, id, handleError, showSuccessToast, handleOpenSaveModal],
  );

  return (
    <Page
      header={{
        title: i18Service.strings('business_settings.title'),
        iconLeft: {
          onPress: () => navigation.navigate('MoreTab'),
        },
        style: applyStyles('py-8'),
      }}
      style={applyStyles('bg-white')}>
      <>
        <FormBuilder
          forceUseFormButton
          fields={formFields}
          actionBtns={[
            {
              isLoading: false,
              title: i18Service.strings(
                'business_settings.action_buttons.preview_receipt_button',
              ),
              variantColor: 'transparent',
              onPress: handleOpenPreviewReceiptModal,
            },
            {
              title: i18Service.strings(
                'business_settings.action_buttons.save_button',
              ),
            },
          ]}
          onSubmit={handleSubmit}
        />
      </>
    </Page>
  );
});
