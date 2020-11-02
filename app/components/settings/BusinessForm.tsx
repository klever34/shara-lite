import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {colors} from '@/styles';
import {useFormik} from 'formik';
import React, {useCallback} from 'react';
import {Alert, Image, Text, View} from 'react-native';
import ImagePicker, {
  ImagePickerOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import * as yup from 'yup';
import {Button} from '../Button';
import {FloatingLabelInput} from '../FloatingLabelInput';
import {Icon} from '../Icon';
import {PhoneNumberField} from '../PhoneNumberField';
import Touchable from '../Touchable';
import {applyStyles} from '@/styles';

export type BusinessFormPayload = {
  name: string;
  address?: string;
  mobile?: string;
  countryCode?: string;
  profileImageFile?: ImagePickerResponse;
};

type Props = {
  onSkip?(): void;
  isLoading?: boolean;
  page?: 'setup' | 'settings';
  initalValues?: BusinessFormPayload;
  onSubmit(payload: BusinessFormPayload): void;
};

const validationSchema = yup.object().shape({
  name: yup.string().required('Business name is required'),
  address: yup.string().required('Business address is required'),
});

export const BusinessForm = ({
  page,
  onSkip,
  onSubmit,
  isLoading,
  initalValues,
}: Props) => {
  const {callingCode} = useIPGeolocation();
  const {
    errors,
    values,
    touched,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    validationSchema,
    initialValues: initalValues || {
      name: '',
      address: '',
      mobile: '',
      countryCode: callingCode,
      profileImageFile: {} as ImagePickerResponse,
    },
    onSubmit: (payload) => {
      const {countryCode, mobile, ...rest} = payload;
      onSubmit({
        mobile: `${countryCode}${mobile}`.replace(/\s/g, ''),
        countryCode,
        ...rest,
      });
    },
  });

  const onChangeMobile = (value: {code: string; number: string}) => {
    const {code, number} = value;
    setFieldValue('countryCode', code);
    setFieldValue('mobile', number);
  };

  const handleAddPicture = useCallback(() => {
    const options: ImagePickerOptions = {
      maxWidth: 256,
      maxHeight: 256,
      noData: true,
      mediaType: 'photo',
      allowsEditing: true,
      title: 'Select a picture',
      takePhotoButtonTitle: 'Take a Photo',
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        // do nothing
      } else if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        const {uri, type, fileName} = response;
        const extensionIndex = uri.lastIndexOf('.');
        const extension = uri.slice(extensionIndex + 1);
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        if (!allowedExtensions.includes(extension)) {
          return Alert.alert('Error', 'That file type is not allowed.');
        }
        const image = {
          uri,
          type,
          name: fileName,
        };
        setFieldValue('profileImageFile', image);
      }
    });
  }, [setFieldValue]);

  return (
    <View>
      {page === 'settings' && (
        <Touchable onPress={handleAddPicture}>
          <View style={applyStyles('mb-xl items-center justify-center')}>
            {values?.profileImageFile?.uri ? (
              <Image
                style={applyStyles('mb-lg items-center justify-center', {
                  width: 100,
                  height: 100,
                  borderRadius: 16,
                  backgroundColor: colors['gray-20'],
                })}
                source={{
                  uri: values?.profileImageFile?.uri ?? '',
                }}
              />
            ) : (
              <View
                style={applyStyles('mb-lg items-center justify-center', {
                  width: 100,
                  height: 100,
                  borderRadius: 16,
                  backgroundColor: colors['gray-20'],
                })}>
                <Icon
                  size={48}
                  name="user"
                  type="feathericons"
                  color={colors['gray-50']}
                />
              </View>
            )}
            <View
              style={applyStyles('flex-row', 'items-center', 'justify-center')}>
              <Icon
                size={24}
                name="camera"
                type="feathericons"
                color={colors.primary}
              />
              <Text
                style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                  fontSize: 16,
                  color: colors.primary,
                })}>
                {values?.profileImageFile?.uri
                  ? 'Edit'
                  : 'Upload Business logo'}
              </Text>
            </View>
          </View>
        </Touchable>
      )}
      <View style={applyStyles({paddingBottom: 18})}>
        <FloatingLabelInput
          label="Business Name"
          value={values.name}
          errorMessage={errors.name}
          inputStyle={applyStyles({
            fontSize: 18,
            width: '100%',
          })}
          onChangeText={handleChange('name')}
          isInvalid={touched.name && !!errors.name}
        />
      </View>
      <View style={applyStyles({paddingBottom: 18})}>
        <FloatingLabelInput
          label="Address"
          value={values.address}
          inputStyle={applyStyles({
            fontSize: 18,
            width: '100%',
          })}
          errorMessage={errors.address}
          onChangeText={handleChange('address')}
          isInvalid={touched.address && !!errors.address}
        />
      </View>
      {page === 'settings' && (
        <View style={applyStyles({paddingBottom: 18})}>
          <PhoneNumberField
            errorMessage={errors.mobile}
            isInvalid={touched.mobile && !!errors.mobile}
            onChangeText={(data) => onChangeMobile(data)}
            value={{
              number: values.mobile ?? '',
              code: values.countryCode ?? callingCode,
            }}
          />
        </View>
      )}
      <View style={applyStyles('mt-xl')}>
        <Button
          variantColor="red"
          onPress={handleSubmit}
          isLoading={isLoading}
          style={applyStyles({marginBottom: 18})}
          title={page === 'setup' ? 'Done' : 'save'}
        />
        {onSkip && (
          <Touchable onPress={onSkip}>
            <View
              style={applyStyles('flex-row items-center justify-center', {
                height: 48,
              })}>
              <Text
                style={applyStyles('text-400', {color: colors['gray-100']})}>
                Skip setup
              </Text>
            </View>
          </Touchable>
        )}
      </View>
    </View>
  );
};
