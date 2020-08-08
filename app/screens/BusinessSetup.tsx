import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {Alert, Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import ImagePicker from 'react-native-image-picker';
//@ts-ignore
import SignatureCapture from 'react-native-signature-capture';
import RNFetchBlob from 'rn-fetch-blob';
import {Button, FloatingLabelInput} from '../components';
import Icon from '../components/Icon';
import Touchable from '../components/Touchable';
import {applyStyles} from '../helpers/utils';
import {getApiService, getAuthService} from '../services';
import {colors} from '../styles';
import {ImagePickerOptions} from 'react-native-image-picker/src/internal/types';

type Fields = {
  address: string;
  business_name: string;
};

export const BusinessSetup = () => {
  const ref = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState(false);
  const [profileImage, setProfileImage] = useState<any | undefined>();
  const [fields, setFields] = useState<Fields>({} as Fields);
  const [isSignatureCaptureShown, setIsSignatureCaptureShown] = useState(false);
  const navigation = useNavigation();

  const apiService = getApiService();
  const authService = getAuthService();
  const user = authService.getUser();

  const onChangeText = (value: string, field: keyof Fields) => {
    setFields({
      ...fields,
      [field]: value,
    });
  };

  const isButtonDisabled = useCallback(() => {
    if (Object.keys(fields).length < 2) {
      return true;
    }
    return false;
  }, [fields]);

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
        setProfileImage(image);
      }
    });
  }, []);

  const handleSkip = useCallback(() => {
    if (user?.businesses && user?.businesses.length) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [navigation, user]);

  const saveSign = useCallback(() => {
    if (ref.current) {
      ref.current.saveImage();
    }
  }, []);

  const resetSign = useCallback(() => {
    if (ref.current) {
      ref.current.resetImage();
      setSignature(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (signatureFile?: any) => {
      const payload = new FormData();
      payload.append('name', fields.business_name);
      payload.append('address', fields.address);
      profileImage && payload.append('profileImageFile', profileImage);
      signatureFile && payload.append('signatureImageFile', signatureFile);

      if (!isButtonDisabled()) {
        try {
          setLoading(true);
          await apiService.businessSetup(payload);
          setLoading(false);
          handleHideSignatureCapture();
          if (user?.businesses && user?.businesses.length) {
            navigation.goBack();
          } else {
            navigation.navigate('Home');
          }
        } catch (error) {
          setLoading(false);
          Alert.alert('Error', error.message);
        }
      }
    },
    [
      user,
      apiService,
      navigation,
      fields.address,
      profileImage,
      isButtonDisabled,
      fields.business_name,
      handleHideSignatureCapture,
    ],
  );

  const onSaveWithSignature = useCallback(
    async (result: {encoded: string; pathName: string}) => {
      const dirs = RNFetchBlob.fs.dirs;
      const path = dirs.DCIMDir + '/signature.png';
      RNFetchBlob.fs.writeFile(path, result.encoded, 'base64').then(() => {
        handleSubmit({
          uri: `file://${path}`,
          name: 'signature.png',
          type: 'image/png',
        });
      });
    },
    [handleSubmit],
  );

  const onSaveWithoutSignature = useCallback(async () => {
    handleSubmit();
  }, [handleSubmit]);

  const onDragEvent = useCallback(() => {
    setSignature(true);
  }, []);

  return (
    <View
      style={applyStyles('flex-1', {
        backgroundColor: colors.white,
      })}>
      <ScrollView style={styles.container}>
        <View style={applyStyles('mb-lg')}>
          <Touchable onPress={handleSkip}>
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
                    source={{uri: profileImage.uri}}
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
                    onDragEvent={onDragEvent}
                    showNativeButtons={false}
                    saveImageFileInExtStorage={false}
                    onSaveEvent={onSaveWithSignature}
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
          style={styles.actionButton}
          onPress={signature ? saveSign : onSaveWithoutSignature}
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