import {StackScreenProps} from '@react-navigation/stack';
import React, {useRef, useState, useCallback} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import ImagePicker from 'react-native-image-picker';
import SignatureCapture from 'react-native-signature-capture';
import {Alert, ScrollView, StyleSheet, Text, View, Image} from 'react-native';
import {Button, FloatingLabelInput} from '../components';
import Icon from '../components/Icon';
import Touchable from '../components/Touchable';
import {applyStyles} from '../helpers/utils';
import {RootStackParamList} from '../index';
import {colors} from '../styles';
import {ImagePickerOptions} from 'react-native-image-picker/src/internal/types';

type Fields = {
  address: string;
  signature: string;
  business_name: string;
};

export const BusinessSetup = ({
  navigation,
}: StackScreenProps<RootStackParamList>) => {
  const ref = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [fields, setFields] = useState<Fields>({} as Fields);
  const [isSignatureCaptureShown, setIsSignatureCaptureShown] = useState(false);

  const handleError = useErrorHandler();

  const onChangeText = (value: string, field: keyof Fields) => {
    setFields({
      ...fields,
      [field]: value,
    });
  };

  const saveSign = useCallback(() => {
    ref.current.saveImage();
  }, []);

  const resetSign = useCallback(() => {
    ref.current.resetImage();
    setSignature(false);
  }, []);

  const onSaveEvent = useCallback((result: any) => {
    //result.encoded - for the base64 encoded png
    //result.pathName - for the file path name
    console.log(result);
  }, []);

  const onDragEvent = useCallback(() => {
    setSignature(true);
  }, []);

  const isButtonDisabled = () => {
    if (Object.keys(fields).length < 2) {
      return true;
    }
    return false;
  };

  const handleShowSignatureCapture = useCallback(() => {
    setIsSignatureCaptureShown(true);
  }, []);

  const handleHideSignatureCapture = useCallback(() => {
    setIsSignatureCaptureShown(false);
  }, []);

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
      console.log('Response = ', response);
      if (response.didCancel) {
        // do nothing
      } else if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        const {uri} = response;
        setProfileImage(uri);
        const extensionIndex = uri.lastIndexOf('.');
        const extension = uri.slice(extensionIndex + 1);
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        //TODO: make API call to save image and get image url
        if (!allowedExtensions.includes(extension)) {
          return Alert.alert('Error', 'That file type is not allowed.');
        }
      }
    });
  }, []);

  const handleSkip = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSubmit = async () => {
    // const apiService = getApiService();
    if (!isButtonDisabled()) {
      try {
        setLoading(true);
        saveSign();
        // await apiService.register(fields);
        setLoading(false);
        handleHideSignatureCapture();
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      } catch (error) {
        handleError(error);
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <View
      style={applyStyles('flex-1', {
        backgroundColor: colors.white,
      })}>
      <ScrollView style={styles.container}>
        <View style={applyStyles('mb-lg')}>
          <Touchable onPress={() => navigation.goBack()}>
            <View style={applyStyles({height: 40, width: 40})}>
              <Icon size={24} type="feathericons" name="arrow-left" />
            </View>
          </Touchable>
        </View>
        <View style={applyStyles({marginBottom: 16})}>
          <Text style={styles.heading}>Business Setup</Text>
          <Text style={styles.description}>
            Create an account to do business faster and better.
          </Text>
        </View>
        <View>
          <View style={applyStyles({marginBottom: 32})}>
            <Touchable onPress={handleAddPicture}>
              <View style={applyStyles('mb-xl items-center justify-center')}>
                {profileImage ? (
                  <Image
                    style={applyStyles('mb-lg items-center justify-center', {
                      width: 100,
                      height: 100,
                      borderRadius: 16,
                      backgroundColor: colors['gray-20'],
                    })}
                    source={{uri: profileImage}}
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
                  style={applyStyles(
                    'flex-row',
                    'items-center',
                    'justify-center',
                  )}>
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
                    {profileImage ? 'Edit' : 'Add profile image'}
                  </Text>
                </View>
              </View>
            </Touchable>
            <View style={styles.inputFieldSpacer}>
              <FloatingLabelInput
                label="Business Name"
                value={fields.business_name}
                inputStyle={styles.inputField}
                onChangeText={(text) => onChangeText(text, 'business_name')}
              />
            </View>
            <View style={styles.inputFieldSpacer}>
              <FloatingLabelInput
                label="Address"
                value={fields.address}
                inputStyle={styles.inputField}
                onChangeText={(text) => onChangeText(text, 'address')}
              />
            </View>
            {isSignatureCaptureShown ? (
              <View
                style={applyStyles({
                  paddingBottom: 100,
                })}>
                <View style={styles.signatureContainer}>
                  <SignatureCapture
                    ref={ref}
                    showBorder={false}
                    viewMode={'portrait'}
                    showTitleLabel={false}
                    onSaveEvent={onSaveEvent}
                    onDragEvent={onDragEvent}
                    showNativeButtons={false}
                    saveImageFileInExtStorage={false}
                    style={applyStyles('flex-1 w-full h-full')}
                  />
                </View>
                <Text
                  style={applyStyles('text-400 text-center', {
                    fontSize: 12,
                    color: colors['gray-300'],
                  })}>
                  Your Signature
                </Text>
                <View
                  style={applyStyles(
                    'flex-1',
                    'flex-row',
                    'justify-center',
                    'item-center',
                  )}>
                  {!!signature && (
                    <Touchable
                      onPress={() => {
                        resetSign();
                      }}>
                      <Text
                        style={applyStyles('py-md text-center text-400', {
                          fontSize: 16,
                        })}>
                        Clear
                      </Text>
                    </Touchable>
                  )}
                </View>
              </View>
            ) : (
              <Touchable onPress={handleShowSignatureCapture}>
                <View
                  style={applyStyles({
                    paddingBottom: 100,
                  })}>
                  <View
                    style={applyStyles(
                      'items-center justify-center',
                      styles.signatureContainer,
                    )}>
                    <Text
                      style={applyStyles(
                        'text-400',
                        'text-center',
                        'text-uppercase',
                        {color: colors['gray-50']},
                      )}>
                      Touch here to sign
                    </Text>
                  </View>
                </View>
              </Touchable>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionButtons}>
        <Button
          title="Skip"
          variantColor="clear"
          onPress={handleSkip}
          style={styles.actionButton}
        />
        <Button
          title="Done"
          variantColor="red"
          disabled={loading}
          isLoading={loading}
          onPress={handleSubmit}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },
  heading: {
    fontSize: 24,
    paddingBottom: 8,
    color: colors.black,
    fontFamily: 'CocogoosePro-Regular',
  },
  description: {
    fontSize: 16,
    lineHeight: 27,
    color: colors['gray-300'],
    fontFamily: 'Rubik-Regular',
  },
  inputField: {
    fontSize: 18,
    width: '100%',
  },
  headerText: {
    fontSize: 40,
    marginBottom: 40,
    color: '#d51a1a',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: 'CocogoosePro-Regular',
  },
  actionButtons: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderTopColor: colors['gray-20'],
  },
  actionButton: {
    width: '48%',
  },
  inputFieldSpacer: {
    paddingBottom: 18,
  },
  signatureContainer: {
    height: 100,
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
    borderColor: colors['gray-20'],
  },
});
