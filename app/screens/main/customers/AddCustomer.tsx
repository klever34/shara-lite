import React, {useCallback, useState} from 'react';
import {SafeAreaView, Text, TextInput, StyleSheet, View} from 'react-native';
import {Button} from '../../../components/Button';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../../styles';

const AddCustomer = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const handleNameChange = useCallback((text: string) => {
    setName(text);
  }, []);

  const handleMobileChange = useCallback((text: string) => {
    setMobile(text);
  }, []);

  const handleSubmit = useCallback(() => {}, []);

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
            placeholder="Phone Number"
            onChangeText={handleMobileChange}
            placeholderTextColor={colors['gray-50']}
          />
        </View>
        <Button
          variantColor="red"
          title="Add customer"
          onPress={handleSubmit}
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
    fontSize: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    paddingBottom: 40,
    color: colors.primary,
  },
});
