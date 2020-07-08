import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RootStackParamList} from '../../index';
import {Button, PasswordField, PhoneNumberField} from '../../components';
import {getAuthService} from '../../services';
import {colors} from '../../styles';
import Icon from '../../components/Icon';
import Touchable from '../../components/Touchable';

type Fields = {
  firstname: string;
  lastname: string;
  mobile: string;
  password: string;
  countryCode: string;
};

export const Register = ({
  navigation,
}: StackScreenProps<RootStackParamList>) => {
  const [loading, setLoading] = React.useState(false);
  const [fields, setFields] = React.useState<Fields>({} as Fields);

  const onChangeText = (value: string, field: keyof Fields) => {
    setFields({
      ...fields,
      [field]: value,
    });
  };

  const onChangeMobile = (value: {code: string; number: string}) => {
    const {code, number} = value;
    setFields({
      ...fields,
      mobile: number,
      countryCode: code,
    });
  };

  const onSubmit = async () => {
    const {mobile, countryCode, ...rest} = fields;
    const payload = {
      ...rest,
      country_code: countryCode,
      mobile: `${countryCode}${mobile}`,
    };
    const authService = getAuthService();
    try {
      setLoading(true);
      await authService.register(payload);
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleNavigate = (route: string) => {
    navigation.reset({
      index: 0,
      routes: [{name: route}],
    });
  };

  const isButtonDisabled = () => {
    if (Object.keys(fields).length < 5) {
      return true;
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.backButton}>
        <Touchable onPress={() => handleNavigate('Welcome')}>
          <Icon size={24} type="ionicons" name="md-arrow-back" />
        </Touchable>
      </View>
      <View style={styles.headerSection}>
        <Text style={styles.heading}>Sign Up</Text>
        <Text style={styles.description}>
          Create an account so you can chat and do business faster and better.
        </Text>
      </View>
      <View style={styles.headerSection}>
        <View>
          <TextInput
            value={fields.firstname}
            style={styles.inputField}
            placeholder="First Name"
            placeholderTextColor={colors['gray-50']}
            onChangeText={(text) => onChangeText(text, 'firstname')}
          />
          <TextInput
            value={fields.lastname}
            placeholder="Last Name"
            style={styles.inputField}
            placeholderTextColor={colors['gray-50']}
            onChangeText={(text) => onChangeText(text, 'lastname')}
          />
          <View style={styles.inputFieldSpacer}>
            <PhoneNumberField
              value={fields.mobile}
              countryCode={fields.countryCode}
              onChangeText={(data) => onChangeMobile(data)}
            />
          </View>
          <View style={styles.inputFieldSpacer}>
            <PasswordField
              value={fields.password}
              onChangeText={(text) => onChangeText(text, 'password')}
            />
          </View>

          <Button
            variantColor="red"
            onPress={onSubmit}
            isLoading={loading}
            title="Create an account"
            disabled={isButtonDisabled() || loading}
          />
        </View>
      </View>

      <View>
        <TouchableOpacity
          style={styles.helpSection}
          onPress={() => handleNavigate('Login')}>
          <Text style={styles.helpSectionText}>Already have an account? </Text>
          <Text style={styles.helpSectionButtonText}>Sign In</Text>
        </TouchableOpacity>
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
    marginBottom: 48,
  },
  headerSection: {
    marginBottom: 48,
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
  form: {
    paddingBottom: 32,
  },
  inputField: {
    height: 40,
    fontSize: 18,
    width: '100%',
    marginBottom: 24,
    borderBottomWidth: 1,
    fontFamily: 'Rubik-Regular',
    borderColor: colors['gray-200'],
  },
  headerText: {
    fontSize: 40,
    marginBottom: 40,
    color: '#d51a1a',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: 'CocogoosePro-Regular',
  },
  helpSection: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpSectionText: {
    fontSize: 16,
    color: colors['gray-100'],
    fontFamily: 'Rubik-Regular',
  },
  helpSectionButtonText: {
    fontSize: 16,
    color: colors.black,
    fontFamily: 'Rubik-Regular',
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
    textDecorationColor: colors.black,
  },
  inputFieldSpacer: {
    marginBottom: 24,
  },
});
