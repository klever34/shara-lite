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
import {Formik, FormikHelpers} from 'formik';
import * as yup from 'yup';
import {FormDefaults} from '@/services/FormDefaults';
import {getAnalyticsService} from '@/services';

type Props = {onSubmit?: (deliveryAgent: IDeliveryAgent) => void};
type Payload = Pick<IDeliveryAgent, 'full_name' | 'mobile'>;

const formValidation = yup.object().shape({
  full_name: yup.string().required('Delivery agent name is required'),
});

export const AddDeliveryAgent = (props: Props) => {
  const {onSubmit} = props;

  const realm = useRealm();
  const navigation = useNavigation();
  const deliveryAgents = getDeliveryAgents({realm});
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  const onFormSubmit = useCallback(
    (values: Payload, {resetForm}: FormikHelpers<Payload>) => {
      if (deliveryAgents.map((item) => item.mobile).includes(values.mobile)) {
        Alert.alert(
          'Error',
          'Delivery Agent with the same phone number has been created.',
        );
      } else {
        setIsLoading(true);
        saveDeliveryAgent({realm, delivery_agent: values});
        setIsLoading(false);
        onSubmit ? onSubmit(values) : navigation.goBack();
        getAnalyticsService()
          .logEvent('deliveryAgentAdded')
          .then(() => {});
        resetForm();
        ToastAndroid.show('Delivery agent added', ToastAndroid.SHORT);
      }
    },
    [realm, onSubmit, deliveryAgents, navigation],
  );

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
        <Formik
          onSubmit={onFormSubmit}
          initialValues={
            {full_name: ''} || FormDefaults.get('deliveryAgent', {})
          }
          validationSchema={formValidation}>
          {({values, errors, touched, handleChange, handleSubmit}) => (
            <>
              <View style={applyStyles('flex-row pb-xl items-center')}>
                <FloatingLabelInput
                  label="Name"
                  value={values.full_name}
                  errorMessage={errors.full_name}
                  onChangeText={handleChange('full_name')}
                  isInvalid={touched.full_name && !!errors.full_name}
                />
              </View>
              <View style={applyStyles('flex-row pb-xl items-center')}>
                <FloatingLabelInput
                  keyboardType="phone-pad"
                  value={values.mobile}
                  label="Phone number (optional)"
                  onChangeText={handleChange('mobile')}
                />
              </View>
              <Button
                title="Save"
                isLoading={isLoading}
                onPress={handleSubmit}
                style={applyStyles({marginVertical: 48})}
              />
            </>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};
