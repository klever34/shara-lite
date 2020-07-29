import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, FloatingLabelInput} from '../components';
import Icon from '../components/Icon';
import Touchable from '../components/Touchable';
import {applyStyles} from '../helpers/utils';
import {RootStackParamList} from '../index';
import {colors} from '../styles';

type Fields = {
  address: string;
  signature: string;
  business_name: string;
};

export const BusinessSetup = ({
  navigation,
}: StackScreenProps<RootStackParamList>) => {
  const [loading, setLoading] = React.useState(false);
  const [fields, setFields] = React.useState<Fields>({} as Fields);

  const handleError = useErrorHandler();

  const onChangeText = (value: string, field: keyof Fields) => {
    setFields({
      ...fields,
      [field]: value,
    });
  };

  const handleSkip = useCallback(() => {}, []);

  const handleSubmit = async () => {
    // const apiService = getApiService();
    try {
      setLoading(true);
      // await apiService.register(fields);
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{name: 'Main'}],
      });
    } catch (error) {
      handleError(error);
      Alert.alert('Error', error.message);
    }
  };

  const isButtonDisabled = () => {
    if (Object.keys(fields).length < 2) {
      return true;
    }
    return false;
  };

  return (
    <View
      style={applyStyles('flex-1', {
        backgroundColor: colors.white,
      })}>
      <ScrollView style={styles.container}>
        <View style={styles.backButton}>
          <Touchable onPress={() => navigation.goBack()}>
            <View style={applyStyles({height: 40, width: 40})}>
              <Icon size={24} type="ionicons" name="md-arrow-back" />
            </View>
          </Touchable>
        </View>
        <View style={applyStyles({marginBottom: 16})}>
          <Text style={styles.heading}>Business Setup</Text>
          <Text style={styles.description}>
            Create an account to do business faster and better
          </Text>
        </View>
        <View>
          <View style={applyStyles({marginBottom: 32})}>
            <Touchable>
              <View style={applyStyles('mb-xl items-center justify-center')}>
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
                    Add profile image
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
          isLoading={loading}
          onPress={handleSubmit}
          style={styles.actionButton}
          disabled={isButtonDisabled() || loading}
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
  backButton: {
    marginBottom: 16,
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
});
