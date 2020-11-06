import {useCallback} from 'react';
import {Alert, ToastAndroid} from 'react-native';
import {getCustomers, saveCustomer} from '@/services/customer/service';
import {ICustomer} from '@/models';
import {useRealm} from '@/services/realm';

export const useAddCustomer = () => {
  const realm = useRealm() as Realm;
  const customers = getCustomers({realm});
  return useCallback(
    (values: ICustomer) => {
      if (customers.filtered('mobile = $0', values.mobile).length) {
        Alert.alert(
          'Info',
          'Customer with the same phone number has been created.',
        );
        return Promise.reject();
      } else {
        saveCustomer({realm, customer: values});
        ToastAndroid.showWithGravityAndOffset(
          'Customer added',
          ToastAndroid.SHORT,
          ToastAndroid.TOP,
          0,
          52,
        );
        return Promise.resolve();
      }
    },
    [customers, realm],
  );
};
