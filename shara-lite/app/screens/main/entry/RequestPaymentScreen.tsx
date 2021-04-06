import {AppInput, Button, CurrencyInput, toNumber} from '@/components';
import {CustomerListItem} from '@/components/CustomerListItem';
import {Page} from '@/components/Page';
import {TitleContainer} from '@/components/TitleContainer';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {MainStackParamList} from '@/screens/main';
import {getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {useFormik} from 'formik';
import React, {useCallback, useRef} from 'react';
import {TextInput, View} from 'react-native';

type RequestPaymentScreenProps = {
  route: RouteProp<MainStackParamList, 'RequestPayment'>;
} & ModalWrapperFields;

const strings = getI18nService().strings;

export default withModal(function RequestPaymentScreen({
  route,
  openModal,
  closeModal,
}: RequestPaymentScreenProps) {
  const {customer} = route.params;

  const navigation = useAppNavigation();

  const onSubmit = useCallback(
    (values) => {
      navigation.navigate('RequestPaymentSuccess', {...values, customer});
    },
    [navigation],
  );

  const {values, handleChange, handleSubmit, setFieldValue} = useFormik({
    initialValues: {
      note: '',
      amount:
        customer.balance && customer.balance != undefined
          ? Math.abs(customer.balance)
          : undefined,
    },
    onSubmit,
  });
  const noteFieldRef = useRef<TextInput | null>(null);

  return (
    <Page header={{iconLeft: {}, title: ' '}}>
      <TitleContainer
        containerStyle={applyStyles('mb-8')}
        title={strings('request_payment.header.title')}
        description={strings('request_payment.header.description')}
      />
      <CustomerListItem
        customer={customer}
        containerStyle={applyStyles('py-16 mb-24')}
      />
      <CurrencyInput
        placeholder="0.00"
        value={values.amount}
        keyboardType="number-pad"
        label={strings('request_payment.fields.amount.label')}
        containerStyle={applyStyles('mb-16')}
        onChangeText={(text) => {
          const value = toNumber(text);
          setFieldValue('amount', value);
        }}
        autoFocus
      />
      <View style={applyStyles('py-12')}>
        <AppInput
          multiline
          ref={noteFieldRef}
          value={values.note}
          onChangeText={handleChange('note')}
          label={strings('request_payment.fields.note.label')}
          style={applyStyles({height: 80, textAlignVertical: 'top'})}
          placeholder={strings('request_payment.fields.note.placeholder')}
        />
      </View>
      <View
        style={applyStyles('py-16 bg-white flex-row items-center justify-end')}>
        <Button
          onPress={handleSubmit}
          title={strings('done')}
          style={applyStyles({width: '48%'})}
        />
      </View>
    </Page>
  );
});
