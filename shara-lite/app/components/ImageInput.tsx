import React, {useEffect, useRef, useState} from 'react';
import {applyStyles, colors} from '@/styles';
import {Text} from '@/components';
import {Image, View, ViewStyle} from 'react-native';
import {ImagePickerResult, useImageInput} from '@/helpers/utils';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';

export type ImageInputProps = {
  label?: string;
  placeholder?: string;
  containerStyle?: ViewStyle;
  value?: ImagePickerResult;
  onChangeValue?: (value: ImagePickerResult) => void;
};

export const ImageInput = ({
  value: initialValue,
  onChangeValue,
  label,
  placeholder,
  containerStyle,
}: ImageInputProps) => {
  const [value, setValue] = useState<ImagePickerResult | undefined>(
    initialValue,
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

  const {current: handleChangeValue} = useRef(onChangeValue);

  useEffect(() => {
    if (imageUrl) {
      handleChangeValue?.(imageUrl);
      setValue(imageUrl);
    }
  }, [handleChangeValue, imageUrl]);

  return (
    <View style={applyStyles(' w-full', containerStyle)}>
      {!!label && (
        <Text style={applyStyles('text-base text-500 text-gray-50 pb-8')}>
          {label}
        </Text>
      )}
      <Touchable onPress={handleImageInputChange}>
        <View
          style={applyStyles(
            'bg-gray-10 w-full h-128 rounded-lg overflow-hidden center p-8 mb-10',
            {
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: '#ECECEC',
              borderRadius: 8,
            },
          )}>
          {value?.uri ? (
            <Image
              resizeMode="contain"
              style={applyStyles('items-center justify-center', {
                width: '100%',
                height: '100%',
                backgroundColor: colors['gray-20'],
              })}
              source={{
                uri: value?.uri ?? '',
              }}
            />
          ) : (
            <>
              <Icon
                size={24}
                name="image"
                type="feathericons"
                color={colors['gray-50']}
              />
              {!!placeholder && (
                <Text
                  style={applyStyles(
                    'tet-700 font-bold text-uppercase text-gray-50 mt-4 text-xxs',
                    {
                      letterSpacing: 1.5,
                    },
                  )}>
                  {placeholder}
                </Text>
              )}
            </>
          )}
        </View>
      </Touchable>
    </View>
  );
};
