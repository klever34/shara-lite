import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Button} from '../../../components/Button';
import {generateUniqueId} from '../../../helpers/utils';
import {saveCustomer} from '../../../services/CustomerService';
import {useRealm} from '../../../services/realm';
import {colors} from '../../../styles';
import {FloatingLabelInput} from '../../../components/FloatingLabelInput';

const AddCustomer = () => {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
  }, []);

  const handleMobileChange = useCallback((text: string) => {
    setMobile(text);
  }, []);

  const handleSubmit = useCallback(() => {
    if (name && mobile) {
      const id = generateUniqueId();
      const customer = {
        id,
        name,
        mobile,
        created_at: new Date(),
      };
      saveCustomer({realm, customer});
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('CustomerDetails', {customer});
      }, 750);
    }
  }, [navigation, name, mobile, realm]);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Text style={styles.title}>Customer Details</Text>
      <View>
        <View style={styles.formInputs}>
          <FloatingLabelInput
            value={name}
            label="Name"
            containerStyle={styles.input}
            onChangeText={handleNameChange}
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
          variantColor="red"
          title="Add customer"
          onPress={handleSubmit}
          isLoading={isLoading}
        />
      </View>
    </KeyboardAvoidingView>
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
});

export default AddCustomer;
