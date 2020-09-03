import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {Alert, ScrollView, Text, View, ToastAndroid} from 'react-native';
import {Button, FloatingLabelInput} from '../../../../components';
import HeaderRight from '../../../../components/HeaderRight';
import {applyStyles} from '../../../../helpers/utils';
import {IDeliveryAgent} from '../../../../models/DeliveryAgent';
import {
  getDeliveryAgents,
  saveDeliveryAgent,
} from '../../../../services/DeliveryAgentService';
import {useRealm} from '../../../../services/realm';
import {colors} from '../../../../styles';

type Props = {onSubmit?: (deliveryAgent: IDeliveryAgent) => void};
type Payload = Pick<IDeliveryAgent, 'full_name' | 'mobile'>;

export const AddDeliveryAgent = (props: Props) => {
  const {onSubmit} = props;

  const realm = useRealm();
  const navigation = useNavigation();
  const deliveryAgents = getDeliveryAgents({realm});
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryAgent, setDeliveryAgent] = useState<Payload>({} as Payload);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
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
    if (Object.keys(deliveryAgent).length >= 1) {
      if (
        deliveryAgents.map((item) => item.mobile).includes(deliveryAgent.mobile)
      ) {
        Alert.alert(
          'Error',
          'Delivery Agent with the same phone number has been created.',
        );
      } else {
        setIsLoading(true);
        saveDeliveryAgent({realm, delivery_agent: deliveryAgent});
        setIsLoading(false);
        clearForm();
        onSubmit ? onSubmit(deliveryAgent) : navigation.goBack();
        ToastAndroid.show('Delivery agent added', ToastAndroid.SHORT);
      }
    } else {
      Alert.alert('Error', 'Please add delivery agent information.');
    }
  }, [realm, clearForm, onSubmit, deliveryAgent, deliveryAgents, navigation]);

  return (
    <View
      style={applyStyles('flex-1', {
        paddingTop: 48,
        backgroundColor: colors.white,
      })}>
      <ScrollView
        persistentScrollbar={true}
        style={applyStyles('px-lg')}
        keyboardShouldPersistTaps="always">
        <Text
          style={applyStyles('text-400 pb-lg', {
            fontSize: 18,
            color: colors.primary,
          })}>
          Delivery Agent Details
        </Text>
        <View style={applyStyles('flex-row pb-xl items-center')}>
          <FloatingLabelInput
            label="Name"
            value={deliveryAgent.full_name}
            onChangeText={(text) => handleChange(text, 'full_name')}
          />
        </View>
        <View style={applyStyles('flex-row pb-xl items-center')}>
          <FloatingLabelInput
            label="Phone number"
            value={deliveryAgent.mobile}
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
