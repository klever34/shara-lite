import React, {useState, useCallback, useLayoutEffect} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {applyStyles} from '../../../../helpers/utils';
import {colors} from '../../../../styles';
import {FloatingLabelInput, Button} from '../../../../components';
import {useRealm} from '../../../../services/realm';
import {useNavigation} from '@react-navigation/native';
import HeaderRight from '../../../../components/HeaderRight';
import {IDeliveryAgent} from '../../../../models/DeliveryAgent';
import {saveDeliveryAgent} from '../../../../services/DeliveryAgentService';

type Payload = Pick<IDeliveryAgent, 'full_name' | 'mobile'>;

export const AddDeliveryAgent = () => {
  const realm = useRealm();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryAgent, setDeliveryAgent] = useState<Payload>({} as Payload);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight menuOptions={[]} />,
    });
  }, [navigation]);

  const handleChange = useCallback(
    (value: string | number, key: keyof Payload) => {
      setDeliveryAgent({
        ...deliveryAgent,
        [key]: value,
      });
    },
    [deliveryAgent],
  );

  const clearForm = useCallback(() => {
    setDeliveryAgent({} as Payload);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      saveDeliveryAgent({realm, delivery_agent: deliveryAgent});
      setIsLoading(false);
      clearForm();
      navigation.goBack();
    }, 300);
  }, [realm, clearForm, deliveryAgent, navigation]);

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
        Delivery Agent Details
      </Text>
      <View style={applyStyles('flex-row', 'items-center')}>
        <FloatingLabelInput
          label="Name"
          value={deliveryAgent.full_name}
          onChangeText={(text) => handleChange(text, 'full_name')}
        />
      </View>
      <View style={applyStyles('flex-row', 'items-center')}>
        <FloatingLabelInput
          label="Phone number"
          value={deliveryAgent.mobile}
          keyboardType="phone-pad"
          onChangeText={(text) => handleChange(text, 'mobile')}
        />
      </View>
      <Button
        title="Add delivery agent"
        isLoading={isLoading}
        onPress={handleSubmit}
        style={applyStyles({marginVertical: 48})}
      />
    </ScrollView>
  );
};
