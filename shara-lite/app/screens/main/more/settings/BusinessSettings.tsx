import {
  BusinessFormPayload,
  FormBuilder,
  FormFields,
  PhoneNumber,
} from '@/components';
import {Page} from '@/components/Page';
import {getAnalyticsService, getApiService, getAuthService} from '@/services';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {applyStyles} from '@/styles';
import React, {useCallback, useContext, useMemo} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert} from 'react-native';
import {ToastContext} from '@/components/Toast';
import {TransactionReview} from '@/components/TransactionReview';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {IReceipt} from '@/models/Receipt';

export const BusinessSettings = withModal((props: ModalWrapperFields) => {
  const {openModal} = props;
  const handleError = useErrorHandler();
  const authService = getAuthService();
  const apiService = getApiService();
  let {callingCode} = useIPGeolocation();
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
  callingCode = country_code ?? callingCode;
  const {showSuccessToast} = useContext(ToastContext);

  const dummyTransaction: IReceipt = {
    tax: 120,
    amount_paid: 2500,
    total_amount: 5500,
    credit_amount: 0,
    is_collection: true,
    created_at: new Date(),
    transaction_date: new Date(),
    customer: {name: 'John Doe'},
  };

  const handleOpenPreviewReceiptModal = useCallback(() => {
    const closeModal = openModal('full', {
      renderContent: () => (
        <TransactionReview
          heading="Receipt"
          onDone={closeModal}
          showAnimation={false}
          showShareButtons={false}
          transaction={dummyTransaction}
          subheading="Here’s what your receipt looks like"
        />
      ),
    });
  }, [openModal, dummyTransaction]);

  const handleOpenSaveModal = useCallback(() => {
    const closeModal = openModal('full', {
      renderContent: () => (
        <TransactionReview
          heading="Saved"
          onDone={closeModal}
          showShareButtons={false}
          transaction={dummyTransaction}
          subheading="Here’s what your receipt looks like"
        />
      ),
    });
  }, [openModal, dummyTransaction]);

  const formFields = useMemo(() => {
    const fields: FormFields<keyof Omit<BusinessFormPayload, 'countryCode'>> = {
      name: {
        type: 'text',
        props: {
          value: name,
          label: 'What’s the name of your business?',
          rightIcon: 'home',
        },
      },
      mobile: {
        type: 'mobile',
        props: {
          value: {
            number: mobile?.startsWith(callingCode)
              ? mobile.replace(callingCode, '')
              : mobile,
            callingCode: callingCode,
          },
          label: 'What’s your business phone number?',
        },
      },
      address: {
        type: 'text',
        props: {
          value: address,
          label: 'Where is your business located?',
          rightIcon: 'map-pin',
        },
      },
      profileImageFile: {
        type: 'image',
        props: {
          label: 'Do you have a logo?',
          placeholder: 'Upload logo',
          value: {uri: profile_image?.url ?? ''},
        },
      },
    };
    return fields;
  }, [address, callingCode, mobile, name, profile_image]);

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
        showSuccessToast('Business settings update successful');
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
        title: 'Business Settings',
        iconLeft: {},
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
              title: 'Preview Receipt',
              variantColor: 'transparent',
              onPress: handleOpenPreviewReceiptModal,
            },
            {title: 'Save'},
          ]}
          onSubmit={handleSubmit}
        />
      </>
    </Page>
  );
});
