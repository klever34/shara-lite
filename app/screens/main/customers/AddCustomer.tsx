import React, {useCallback, useState} from 'react';
import {SafeAreaView, Text, TextInput, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../../../components/Button';
import {useRealm} from '../../../services/realm';
import {generateUniqueId} from '../../../helpers/utils';
import {colors} from '../../../styles';
import {saveCustomer} from '../../../services/CustomerService';

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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Customer Details</Text>
      <View>
        <View style={styles.formInputs}>
          <TextInput
            value={name}
            placeholder="Name"
            style={styles.input}
            onChangeText={handleNameChange}
            placeholderTextColor={colors['gray-50']}
          />
          <TextInput
            value={mobile}
            style={styles.input}
            autoCompleteType="tel"
            keyboardType="phone-pad"
            placeholder="Phone Number"
            onChangeText={handleMobileChange}
            placeholderTextColor={colors['gray-50']}
          />
        </View>
        <Button
          variantColor="red"
          title="Add customer"
          onPress={handleSubmit}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
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
    fontSize: 18,
    width: '100%',
    marginBottom: 24,
    borderBottomWidth: 1,
    fontFamily: 'Rubik-Regular',
    borderColor: colors['gray-200'],
  },
  title: {
    fontSize: 18,
    paddingBottom: 40,
    color: colors.primary,
    fontFamily: 'Rubik-Regular',
  },
});

export default AddCustomer;
