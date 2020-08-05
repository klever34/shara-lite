import React, {useState, useCallback, useLayoutEffect} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {applyStyles} from '../../../../helpers/utils';
import {colors} from '../../../../styles';
import {FloatingLabelInput, Button} from '../../../../components';
import {useRealm} from '../../../../services/realm';
import {useNavigation} from '@react-navigation/native';
import HeaderRight from '../../../../components/HeaderRight';
import {ISupplier} from '../../../../models/Supplier';
import {saveSupplier} from '../../../../services/SupplierService';

type Payload = Pick<ISupplier, 'name' | 'mobile' | 'address'>;

export const AddSupplier = () => {
  const realm = useRealm();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [supplier, setSupplier] = useState<Payload>({} as Payload);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight menuOptions={[]} />,
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

  const handleSubmit = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      saveSupplier({realm, supplier});
      setIsLoading(false);
      clearForm();
      navigation.goBack();
    }, 300);
  }, [realm, clearForm, supplier, navigation]);

  return (
    <ScrollView
      style={applyStyles('px-lg', {
        paddingTop: 40,
        backgroundColor: colors.white,
      })}>
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
          label="Address"
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
        title="Add supplier"
        isLoading={isLoading}
        onPress={handleSubmit}
        style={applyStyles({marginVertical: 48})}
      />
    </ScrollView>
  );
};
