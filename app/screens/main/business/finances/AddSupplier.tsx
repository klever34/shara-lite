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
import {getAnalyticsService} from '../../../../services';
import {useErrorHandler} from 'react-error-boundary';
import {useScreenRecord} from '../../../../services/analytics';

type Payload = Pick<ISupplier, 'name' | 'mobile' | 'address'>;

export const AddSupplier = () => {
  useScreenRecord();
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
  const handleError = useErrorHandler();

  const handleSubmit = useCallback(() => {
    if (supplier.name && supplier.mobile) {
      setIsLoading(true);
      setTimeout(() => {
        saveSupplier({realm, supplier});
        getAnalyticsService().logEvent('supplierAdded').catch(handleError);
        setIsLoading(false);
        clearForm();
        navigation.goBack();
      }, 300);
    }
  }, [supplier, realm, handleError, clearForm, navigation]);

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
        disabled={isLoading}
        isLoading={isLoading}
        onPress={handleSubmit}
        style={applyStyles({marginVertical: 48})}
      />
    </ScrollView>
  );
};
