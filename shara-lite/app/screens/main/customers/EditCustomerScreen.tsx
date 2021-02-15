import {AppInput, Button, PhoneNumber, PhoneNumberField} from '@/components';
import {Icon} from '@/components/Icon';
import {Page} from '@/components/Page';
import PlaceholderImage from '@/components/PlaceholderImage';
import {ToastContext} from '@/components/Toast';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {convertUriToBase64, useImageInput} from '@/helpers/utils';
import {getAnalyticsService} from '@/services';
import {useCustomer} from '@/services/customer/hook';
import {handleError} from '@/services/error-boundary';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {useFormik} from 'formik';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Text} from '@/components';
import {View} from 'react-native';
import {MainStackParamList} from '..';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

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
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const handleEditCustomer = useCallback(
      async (updates) => {
        try {
          setLoading(true);
          await updateCustomer({customer, updates});
          setLoading(false);
          showSuccessToast(strings('customers.customer_edited'));
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
          showSuccessToast(strings('customers.customer_deleted'));
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
              {strings('customers.confirm_delete', {
                customer_name: customer.name,
              })}
            </Text>
            <View
              style={applyStyles(
                'pt-24 flex-row items-center justify-between',
              )}>
              <Button
                title={strings('yes_delete')}
                isLoading={isDeleting}
                onPress={() => {
                  handleDeleteCustomer(close);
                }}
                variantColor="transparent"
                style={applyStyles({width: '48%'})}
              />
              <Button
                title={strings('cancel')}
                onPress={() => close()}
                style={applyStyles({width: '100%'})}
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

    const {imageUrl, handleImageInputChange} = useImageInput(undefined, {
      maxWidth: 256,
      maxHeight: 256,
      noData: true,
      mediaType: 'photo',
      allowsEditing: true,
      title: 'Select a picture',
      takePhotoButtonTitle: 'Take a Photo',
      storageOptions: {
        cameraRoll: true,
      },
    });

    const {values, setFieldValue, handleChange, handleSubmit} = useFormik({
      initialValues: {
        name: customer.name,
        notes: customer.notes,
        image: customer.image,
        countryCode: callingCode,
        mobile: getMobileNumber(customer.mobile),
      },
      onSubmit: ({name, image, mobile, countryCode, notes}) => {
        handleEditCustomer({
          name,
          notes,
          image,
          mobile: `+${countryCode}${mobile}`,
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

    const setCustomerImage = useCallback(
      async (uri) => {
        try {
          const base64Image = await convertUriToBase64(uri);
          setFieldValue('image', `data:image/png;base64,${base64Image}`);
          setIsUploadingImage(false);
        } catch (error) {
          handleError(error);
        }
      },
      [setFieldValue],
    );

    useEffect(() => {
      const uri = imageUrl?.uri;
      if (uri) {
        setIsUploadingImage(true);
        setCustomerImage(uri);
      }
    }, [imageUrl, setCustomerImage]);

    return (
      <Page
        header={{
          iconLeft: {},
          title: strings('customers.customer_profile'),
          style: applyStyles('py-8'),
        }}
        style={applyStyles('bg-white')}>
        <View style={applyStyles('mb-24 center')}>
          <Touchable onPress={handleImageInputChange}>
            <View>
              <PlaceholderImage
                text={values?.name ?? ''}
                isLoading={isUploadingImage}
                style={applyStyles(' w-64 h-64 rounded-32')}
                image={values.image ? {uri: values.image} : undefined}
              />
              <View
                style={applyStyles(
                  'center bg-white w-24 h-24 rounded-12 absolute right-0 bottom-0',
                )}>
                <Icon
                  size={14}
                  name="camera"
                  type="feathericons"
                  color={colors['gray-50']}
                />
              </View>
            </View>
          </Touchable>
        </View>
        <AppInput
          label={strings('fields.name.label')}
          value={values.name}
          onChangeText={handleChange('name')}
          containerStyle={applyStyles('mb-24')}
        />
        <PhoneNumberField
          rightIcon={undefined}
          label={`${strings('customers.fields.phone.label')} (${strings(
            'optional',
          )})`}
          placeholder={strings('customers.fields.phone.placeholder')}
          containerStyle={applyStyles('mb-24')}
          onChangeText={(data) => onChangeMobile(data)}
          value={{
            number: values.mobile ? values.mobile : '',
            callingCode: values.countryCode ? values.countryCode : '',
          }}
        />
        <AppInput
          multiline
          label={strings('customers.fields.notes.label')}
          value={values.notes}
          onChangeText={handleChange('notes')}
          containerStyle={applyStyles('mb-24')}
          placeholder={strings('customers.fields.notes.placeholder')}
        />
        <View
          style={applyStyles('pt-24 flex-row items-center justify-between')}>
          <Button
            title={strings('customers.delete_customer')}
            variantColor="transparent"
            style={applyStyles({width: '100%'})}
            onPress={handleOpenDeleteConfirmation}
          />
          <Button
            title={strings('save')}
            isLoading={loading}
            onPress={handleSubmit}
            style={applyStyles({width: '100%'})}
          />
        </View>
      </Page>
    );
  },
);
