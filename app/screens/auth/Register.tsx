import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  FloatingLabelInput,
  PasswordField,
  PhoneNumberField,
} from '../../components';
import Icon from '../../components/Icon';
import Touchable from '../../components/Touchable';
import {applyStyles} from '../../helpers/utils';
import {RootStackParamList} from '../../index';
import {getApiService} from '../../services';
import {colors} from '../../styles';

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
    const apiService = getApiService();
    try {
      setLoading(true);
      await apiService.register(payload);
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
    <ScrollView style={styles.container}>
      <View style={styles.backButton}>
        <Touchable onPress={() => handleNavigate('Welcome')}>
          <Icon size={24} type="ionicons" name="md-arrow-back" />
        </Touchable>
      </View>
      <View style={applyStyles({marginBottom: 16})}>
        <Text style={styles.heading}>Sign Up</Text>
        <Text style={styles.description}>
          Create an account to do business faster and better
        </Text>
      </View>
      <View>
        <View style={applyStyles({marginBottom: 32})}>
          <View style={styles.inputFieldSpacer}>
            <FloatingLabelInput
              label="First Name"
              value={fields.firstname}
              inputStyle={styles.inputField}
              onChangeText={(text) => onChangeText(text, 'firstname')}
            />
          </View>
          <View style={styles.inputFieldSpacer}>
            <FloatingLabelInput
              label="Last Name"
              value={fields.lastname}
              inputStyle={styles.inputField}
              onChangeText={(text) => onChangeText(text, 'lastname')}
            />
          </View>
          <View style={applyStyles({paddingVertical: 18})}>
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
        </View>
      </View>
      <View>
        <Button
          variantColor="red"
          onPress={onSubmit}
          isLoading={loading}
          title="Create an account"
          style={applyStyles({
            marginBottom: 24,
          })}
          disabled={isButtonDisabled() || loading}
        />
        <TouchableOpacity
          style={styles.helpSection}
          onPress={() => handleNavigate('Login')}>
          <Text style={styles.helpSectionText}>Already have an account? </Text>
          <Text style={styles.helpSectionButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  helpSection: {
    marginBottom: 80,
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
    paddingBottom: 18,
  },
});
