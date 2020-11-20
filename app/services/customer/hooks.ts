import {useCallback, useContext} from 'react';
import {Alert} from 'react-native';
import {getCustomers, saveCustomer} from '@/services/customer/service';
import {ICustomer} from '@/models';
import {useRealm} from '@/services/realm';
import {ToastContext} from '@/components/Toast';
import {SharaAppEventsProperties} from '@/services/analytics';

export const useAddCustomer = () => {
  const realm = useRealm() as Realm;
  const customers = getCustomers({realm});
  const {showSuccessToast} = useContext(ToastContext);
  return useCallback(
    (
      values: ICustomer,
      source: SharaAppEventsProperties['customerAdded']['source'],
    ) => {
      if (
        values.mobile &&
        customers.filtered(
          'mobile = $0' + (values._id ? ' AND _id != $1' : ''),
          values.mobile,
          values._id,
        ).length
      ) {
        Alert.alert(
          'Info',
          'Customer with the same phone number has been created.',
        );
        return Promise.reject();
      } else {
        saveCustomer({realm, customer: values, source});
        showSuccessToast?.('Customer saved');
        return Promise.resolve();
      }
    },
    [customers, realm, showSuccessToast],
  );
};
