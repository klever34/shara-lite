import {AppInput, Button, PhoneNumber, PhoneNumberField} from '@/components';
import {Page} from '@/components/Page';
import PlaceholderImage from '@/components/PlaceholderImage';
import {ToastContext} from '@/components/Toast';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {getCustomerWhatsappNumber} from '@/helpers/utils';
import {getAnalyticsService} from '@/services';
import {useCustomer} from '@/services/customer/hook';
import {handleError} from '@/services/error-boundary';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {useFormik} from 'formik';
import React, {useCallback, useContext, useState} from 'react';
import {Text, View} from 'react-native';
import {MainStackParamList} from '..';
import {useTransaction} from '@/services/transaction';

type EditCustomerScreenProps = {
  route: RouteProp<MainStackParamList, 'EditCustomer'>;
} & ModalWrapperFields;

export const EditCustomerScreen = withModal(
  (props: EditCustomerScreenProps) => {
    const {route, openModal} = props;
    const {customer} = route.params;
    const navigation = useAppNavigation();
    const {updateCustomer, deleteCustomer} = useCustomer();
    const {deleteCustomerTransactions} = useTransaction();
    const {callingCode} = useIPGeolocation();
    const {showSuccessToast} = useContext(ToastContext);

    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEditCustomer = useCallback(
      async (updates) => {
        try {
          setLoading(true);
          await updateCustomer({customer, updates});
          setLoading(false);
          showSuccessToast('CUSTOMER EDITED');
          getAnalyticsService()
            .logEvent('customerEdited', {})
            .then(() => {})
            .catch(handleError);
          navigation.goBack();
        } catch (error) {
          setLoading(false);
          handleError(error);
        }
      },
      [customer, updateCustomer, navigation, showSuccessToast],
    );

    const handleDeleteCustomer = useCallback(
      async (callback: () => void) => {
        try {
          setIsDeleting(true);
          await deleteCustomer({customer});
          deleteCustomerTransactions({customer}).then(() => {});
          setIsDeleting(false);
          showSuccessToast('CUSTOMER DELETED');
          getAnalyticsService()
            .logEvent('customerDeleted', {})
            .then(() => {})
            .catch(handleError);
          callback();
          navigation.navigate('Home');
        } catch (error) {
          setIsDeleting(false);
          handleError(error);
        }
      },
      [
        customer,
        deleteCustomer,
        deleteCustomerTransactions,
        navigation,
        showSuccessToast,
      ],
    );

    const handleOpenDeleteConfirmation = useCallback(() => {
      const close = openModal('bottom-half', {
        renderContent: () => (
          <View style={applyStyles('p-16')}>
            <Text
              style={applyStyles(
                'text-center text-700 text-gray-300 text-base',
              )}>
              Are you sure you want to delete{' '}
              <Text style={applyStyles('text-700')}>{customer.name}</Text> as a
              customer?
            </Text>
            <View
              style={applyStyles(
                'pt-24 flex-row items-center justify-between',
              )}>
              <Button
                title="Yes, Delete"
                isLoading={isDeleting}
                onPress={() => {
                  handleDeleteCustomer(close);
                }}
                variantColor="transparent"
                style={applyStyles({width: '48%'})}
              />
              <Button
                title="Cancel"
                onPress={() => close()}
                style={applyStyles({width: '48%'})}
              />
            </View>
          </View>
        ),
      });
    }, [openModal, customer, handleDeleteCustomer, isDeleting]);

    const getMobileNumber = useCallback(
      (mobile) => {
        if (mobile.startsWith(callingCode)) {
          return mobile.replace(callingCode, '');
        }
        if (mobile.startsWith(`+${callingCode}`)) {
          return mobile.replace(`+${callingCode}`, '');
        }
        return mobile;
      },
      [callingCode],
    );

    const {values, setFieldValue, handleChange, handleSubmit} = useFormik({
      initialValues: {
        name: customer.name,
        countryCode: callingCode,
        mobile: getMobileNumber(customer.mobile),
      },
      onSubmit: (payload) => {
        handleEditCustomer({
          name: payload.name,
          mobile: getCustomerWhatsappNumber(
            payload.mobile,
            payload.countryCode,
          ),
        });
      },
    });

    const onChangeMobile = useCallback(
      (value: PhoneNumber) => {
        setFieldValue('countryCode', value.callingCode);
        setFieldValue('mobile', value.number);
      },
      [setFieldValue],
    );

    return (
      <Page
        header={{
          iconLeft: {},
          title: 'Customer Profile',
          style: applyStyles('py-8'),
        }}
        style={applyStyles('bg-white')}>
        <View style={applyStyles('mb-24 center')}>
          <PlaceholderImage
            text={values?.name ?? ''}
            style={applyStyles(' w-60 h-60 rounded-32')}
          />
        </View>
        <AppInput
          label="Name"
          value={values.name}
          onChangeText={handleChange('name')}
          containerStyle={applyStyles('mb-24')}
        />
        <PhoneNumberField
          rightIcon={undefined}
          label="Phone number (Optional)"
          placeholder="Enter customer number"
          containerStyle={applyStyles('mb-24')}
          onChangeText={(data) => onChangeMobile(data)}
          value={{
            number: values.mobile ? values.mobile : '',
            callingCode: values.countryCode ? values.countryCode : '',
          }}
        />
        <View
          style={applyStyles('pt-24 flex-row items-center justify-between')}>
          <Button
            title="Delete Customer"
            variantColor="transparent"
            style={applyStyles({width: '48%'})}
            onPress={handleOpenDeleteConfirmation}
          />
          <Button
            title="Save"
            isLoading={loading}
            onPress={handleSubmit}
            style={applyStyles({width: '48%'})}
          />
        </View>
      </Page>
    );
  },
);
