import React, {useContext, useEffect} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, PasswordField, PhoneNumberField} from '../../components';
import Icon from '../../components/Icon';
import Touchable from '../../components/Touchable';
import {applyStyles} from '../../helpers/utils';
import {getApiService, getRealmService} from '../../services';
import {colors} from '../../styles';
import {loginToRealm} from '../../services/realm';
import {RealmContext} from '../../services/realm/provider';
import {setPartitionKey} from '../../helpers/models';

type Fields = {
  mobile: string;
  password: string;
  countryCode: string | null;
};

export const Login = ({navigation}: any) => {
  // @ts-ignore
  const {realm, updateSyncRealm, logoutFromRealm} = useContext(RealmContext);
  const [loading, setLoading] = React.useState(false);
  const [fields, setFields] = React.useState<Fields>({} as Fields);

  useEffect(() => {
    setTimeout(() => {
      logoutFromRealm && logoutFromRealm();
    }, 3000);
  }, [logoutFromRealm]);

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
      mobile: `${countryCode}${mobile}`,
    };
    const apiService = getApiService();
    try {
      setLoading(true);
      const loginResponse = await apiService.logIn(payload);
      const {
        data: {
          realmCredentials: {jwt},
          user,
        },
      } = loginResponse;
      const createdRealm = await loginToRealm({jwt});
      updateSyncRealm && updateSyncRealm(createdRealm);
      const realmService = getRealmService();
      realmService.setInstance(realm as Realm);
      await setPartitionKey({key: user.id.toString()});

      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{name: 'Main'}],
      });
    } catch (error) {
      setLoading(false);
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
    return !fields.mobile || !fields.password;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backButton}>
        <Touchable onPress={() => handleNavigate('Welcome')}>
          <View style={applyStyles({height: 40, width: 40})}>
            <Icon size={24} type="feathericons" name="arrow-left" />
          </View>
        </Touchable>
      </View>
      <View style={styles.headerSection}>
        <Text style={styles.heading}>Welcome Back!</Text>
        <Text style={styles.description}>Sign in to your account.</Text>
      </View>
      <View style={styles.form}>
        <View style={styles.inputField}>
          <PhoneNumberField
            value={fields.mobile}
            countryCode={fields.countryCode}
            onChangeText={(data) => onChangeMobile(data)}
          />
        </View>
        <View style={styles.inputField}>
          <PasswordField
            value={fields.password}
            onChangeText={(text) => onChangeText(text, 'password')}
          />
        </View>
        <Button
          title="Continue"
          variantColor="red"
          onPress={onSubmit}
          isLoading={loading}
          disabled={isButtonDisabled()}
        />
      </View>
      <View>
        <TouchableOpacity
          style={styles.helpSection}
          onPress={() => handleNavigate('Register')}>
          <Text style={styles.helpSectionText}>Don’t have an account? </Text>
          <Text style={styles.helpSectionButtonText}>Sign Up</Text>
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
    marginBottom: 16,
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
    marginBottom: 24,
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
});
