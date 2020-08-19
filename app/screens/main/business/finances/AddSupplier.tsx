import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert, ScrollView, Text, View, ToastAndroid} from 'react-native';
import {Button, FloatingLabelInput} from '../../../../components';
import HeaderRight from '../../../../components/HeaderRight';
import {applyStyles} from '../../../../helpers/utils';
import {ISupplier} from '../../../../models/Supplier';
import {getAnalyticsService} from '../../../../services';
import {useScreenRecord} from '../../../../services/analytics';
import {useRealm} from '../../../../services/realm';
import {getSuppliers, saveSupplier} from '../../../../services/SupplierService';
import {colors} from '../../../../styles';

type Payload = Pick<ISupplier, 'name' | 'mobile' | 'address'>;

export const AddSupplier = () => {
  useScreenRecord();
  const realm = useRealm();
  const navigation = useNavigation();
  const suppliers = getSuppliers({realm});
  const [isLoading, setIsLoading] = useState(false);
  const [supplier, setSupplier] = useState<Payload>({} as Payload);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  const handleChange = useCallback(
    (value: string | number, key: keyof Payload) => {
      setSupplier({
        ...supplier,
        [key]: value,
      });
    },
    [supplier],
  );

  const clearForm = useCallback(() => {
    setSupplier({} as Payload);
  }, []);
  const handleError = useErrorHandler();

  const handleSubmit = useCallback(() => {
    if (supplier.name && supplier.mobile) {
      if (suppliers.map((item) => item.mobile).includes(supplier.mobile)) {
        Alert.alert(
          'Error',
          'Supplier with the same phone number has been created.',
        );
      } else {
        setIsLoading(true);
        setTimeout(() => {
          saveSupplier({realm, supplier});
          getAnalyticsService().logEvent('supplierAdded').catch(handleError);
          setIsLoading(false);
          clearForm();
          navigation.goBack();
          ToastAndroid.show('Supplier added', ToastAndroid.SHORT);
        }, 300);
      }
    } else {
      Alert.alert('Info', "Please provider supplier's name and phone number");
    }
  }, [realm, clearForm, supplier, suppliers, navigation, handleError]);

  return (
    <View
      style={applyStyles('flex-1', {
        backgroundColor: colors.white,
      })}>
      <ScrollView
        style={applyStyles('px-lg', {paddingTop: 48})}
        keyboardShouldPersistTaps="always">
        <Text
          style={applyStyles('text-400', {
            fontSize: 18,
            color: colors.primary,
          })}>
          Supplier Details
        </Text>
        <View style={applyStyles('flex-row', 'items-center')}>
          <FloatingLabelInput
            label="Name"
            value={supplier.name}
            onChangeText={(text) => handleChange(text, 'name')}
          />
        </View>
        <View style={applyStyles('flex-row', 'items-center')}>
          <FloatingLabelInput
            label="Address (optional)"
            value={supplier.address}
            onChangeText={(text) => handleChange(text, 'address')}
          />
        </View>
        <View style={applyStyles('flex-row', 'items-center')}>
          <FloatingLabelInput
            label="Phone number"
            value={supplier.mobile}
            keyboardType="phone-pad"
            onChangeText={(text) => handleChange(text, 'mobile')}
          />
        </View>
        <Button
          title="Save"
          isLoading={isLoading}
          onPress={handleSubmit}
          style={applyStyles({marginVertical: 48})}
        />
      </ScrollView>
    </View>
  );
};
