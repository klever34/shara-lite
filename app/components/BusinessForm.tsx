import {applyStyles} from '@/helpers/utils';
import {colors} from '@/styles';
import {useFormik} from 'formik';
import React, {useCallback} from 'react';
import {Alert, Image, Text, View} from 'react-native';
import ImagePicker, {
  ImagePickerOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import * as yup from 'yup';
import {Button} from './Button';
import {FloatingLabelInput} from './FloatingLabelInput';
import {Icon} from './Icon';
import Touchable from './Touchable';

type Payload = {
  name: string;
  address?: string;
  profileImageFile?: ImagePickerResponse;
};

type Props = {
  onSkip?(): void;
  page?: 'setup' | 'settings';
  onSubmit(payload: Payload): void;
};

const validationSchema = yup.object().shape({
  name: yup.string().required('Business name is required'),
  address: yup.string().required('Business address is required'),
});

export const BusinessForm = ({page, onSubmit, onSkip}: Props) => {
  const {
    errors,
    values,
    touched,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    validationSchema,
    initialValues: {
      name: '',
      address: '',
      mobile: '',
      profileImageFile: {} as ImagePickerResponse,
    },
    onSubmit: (payload) => onSubmit(payload),
  });
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
            {values.profileImageFile ? (
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
                {values.profileImageFile ? 'Edit' : 'Upload Business logo'}
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
          isInvalid={touched.name && !!errors.name}
          onChangeText={handleChange('business_name')}
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
          <FloatingLabelInput
            label="Phone Number"
            value={values.mobile}
            inputStyle={applyStyles({
              fontSize: 18,
              width: '100%',
            })}
            errorMessage={errors.mobile}
            onChangeText={handleChange('mobile')}
            isInvalid={touched.mobile && !!errors.mobile}
          />
        </View>
      )}
      <View>
        <Button
          variantColor="red"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          style={applyStyles({marginBottom: 18})}
          title={page === 'setup' ? 'Done' : 'save'}
        />
        {onSkip && (
          <Button title="Skip" variantColor="clear" onPress={onSkip} />
        )}
      </View>
    </View>
  );
};
