import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {useErrorHandler} from '@/services/error-boundary';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ToastAndroid,
} from 'react-native';
import {Button, FloatingLabelInput} from '../../../components';
import {applyStyles} from '@/helpers/utils';
import {getAnalyticsService} from '@/services';
import {useScreenRecord} from '@/services/analytics';
import {getCustomers, saveCustomer} from '@/services/CustomerService';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import {ICustomer} from '@/models';
import {FormDefaults} from '@/services/FormDefaults';

type Props = {
  onSubmit?: (customer: ICustomer) => void;
};

const AddCustomer = (props: Props) => {
  useScreenRecord();
  const {onSubmit} = props;
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const customers = getCustomers({realm});
  const [name, setName] = useState(FormDefaults.get('newCustomerName', ''));
  const [mobile, setMobile] = useState(
    FormDefaults.get('newCustomerMobile', ''),
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
  }, []);

  const handleMobileChange = useCallback((text: string) => {
    setMobile(text);
  }, []);

  const handleError = useErrorHandler();

  const handleSubmit = useCallback(() => {
    if (name && mobile) {
      if (customers.map((item) => item.mobile).includes(mobile)) {
        Alert.alert(
          'Info',
          'Customer with the same phone number has been created.',
        );
      } else {
        const customer = {
          name,
          mobile,
        };
        saveCustomer({realm, customer});
        setIsLoading(true);
        setIsLoading(false);
        getAnalyticsService().logEvent('customerAdded').catch(handleError);
        onSubmit ? onSubmit(customer) : navigation.goBack();
        ToastAndroid.show('Customer added', ToastAndroid.SHORT);
      }
    }
  }, [navigation, name, mobile, realm, onSubmit, customers, handleError]);

  return (
    <ScrollView
      persistentScrollbar={true}
      style={styles.container}
      keyboardShouldPersistTaps="always">
      <Text style={styles.title}>Customer Details</Text>
      <View>
        <View style={styles.formInputs}>
          <FloatingLabelInput
            value={name}
            label="Name"
            onChangeText={handleNameChange}
            containerStyle={applyStyles('mb-xl')}
          />
          <FloatingLabelInput
            value={mobile}
            label="Phone Number"
            autoCompleteType="tel"
            keyboardType="phone-pad"
            containerStyle={styles.input}
            onChangeText={handleMobileChange}
          />
        </View>
        <Button
          title="Save"
          variantColor="red"
          isLoading={isLoading}
          style={styles.button}
          onPress={handleSubmit}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 32,
    backgroundColor: colors.white,
  },
  formInputs: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    paddingBottom: 40,
    color: colors.primary,
    fontFamily: 'Rubik-Regular',
  },
  button: {
    marginBottom: 40,
  },
});

export default AddCustomer;
