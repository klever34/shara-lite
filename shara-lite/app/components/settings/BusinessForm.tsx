import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {colors} from '@/styles';
import {useFormik} from 'formik';
import React, {useEffect, useMemo} from 'react';
import {Text} from '@/components';
import {Image, View} from 'react-native';
import * as yup from 'yup';
import {Button} from '../Button';
import {FloatingLabelInput, PhoneNumber, PhoneNumberField} from '@/components';
import {Icon} from '../Icon';
import Touchable from '../Touchable';
import {applyStyles} from '@/styles';
import {ImagePickerResult, useImageInput} from '@/helpers/utils';
// Todo: Translate
import {getI18nService} from '@/services';
const strings = getI18nService().strings;
export type BusinessFormPayload = {
  name: string;
  address?: string;
  mobile?: string;
  countryCode?: string;
  profileImageFile?: ImagePickerResult;
};

type BusinessFormProps = {
  onSkip?(): void;
  isLoading?: boolean;
  page?: 'setup' | 'settings';
  initalValues?: BusinessFormPayload;
  onSubmit(payload: BusinessFormPayload): void;
};

export const BusinessForm = ({
  page,
  onSkip,
  onSubmit,
  isLoading,
  initalValues,
}: BusinessFormProps) => {
  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        name: yup.string().required('Business name is required'),
        address: yup.string().required('Business address is required'),
      }),
    [],
  );
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

  const onChangeMobile = (value: PhoneNumber) => {
    setFieldValue('countryCode', value.callingCode);
    setFieldValue('mobile', value.number);
  };

  const {imageUrl, handleImageInputChange} = useImageInput(undefined, {
    maxWidth: 256,
    maxHeight: 256,
    noData: true,
    mediaType: 'photo',
    allowsEditing: true,
    title: 'Select a picture',
    takePhotoButtonTitle: 'Take a Photo',
  });

  useEffect(() => {
    setFieldValue('profileImageFile', imageUrl);
  }, [imageUrl, setFieldValue]);

  return (
    <View>
      {page === 'settings' && (
        <Touchable onPress={handleImageInputChange}>
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
                  uri: values.profileImageFile.uri ?? '',
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
                  ? strings('edit')
                  : strings('upload_business_logo')}
              </Text>
            </View>
          </View>
        </Touchable>
      )}
      <View style={applyStyles({paddingBottom: 18})}>
        <FloatingLabelInput
          label={strings('business_name')}
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
          label={strings('address')}
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
              callingCode: values.countryCode ?? callingCode,
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
                {strings('skip_setup')}
              </Text>
            </View>
          </Touchable>
        )}
      </View>
    </View>
  );
};
