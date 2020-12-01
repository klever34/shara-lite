import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Page} from '@/components/Page';
import {FlatList, View, Text, ListRenderItemInfo} from 'react-native';
import {getAnalyticsService, getContactService} from '@/services';
import {useAsync} from '@/services/api';
import {useRealm} from '@/services/realm';
import {getCustomers} from '@/services/customer';
import orderBy from 'lodash/orderBy';
import {ICustomer} from '@/models';
import Touchable from '@/components/Touchable';
import {applyStyles} from '@/styles';
import PlaceholderImage from '@/components/PlaceholderImage';
import {useTransaction} from '@/services/transaction';
import {handleError} from '@/services/error-boundary';

type CustomerListItem =
  | Pick<
      ICustomer,
      | 'name'
      | 'mobile'
      | 'remainingCreditAmount'
      | 'overdueCreditAmount'
      | '_id'
    >
  | {
      name: string;
      mobile?: string;
    };
const getPhoneContactsPromiseFn = () => getContactService().getPhoneContacts();

type CustomerListScreenProps = {
  closeModal: () => void;
};

export const CustomerListScreen = ({closeModal}: CustomerListScreenProps) => {
  const realm = useRealm();
  const [phoneContacts, setPhoneContacts] = useState<CustomerListItem[]>([]);
  const {run: runGetPhoneContacts} = useAsync(getPhoneContactsPromiseFn, {
    defer: true,
  });
  useEffect(() => {
    const customers = getCustomers({realm});
    runGetPhoneContacts().then((contacts) => {
      setPhoneContacts(
        contacts.reduce<CustomerListItem[]>(
          (acc, {givenName, familyName, phoneNumber}) => {
            const existing = customers.filtered(
              `mobile = "${phoneNumber.number}"`,
            );
            if (existing.length) {
              return acc;
            }
            return [
              ...acc,
              {
                name: `${givenName} ${familyName}`,
                mobile: phoneNumber.number,
              },
            ];
          },
          [],
        ),
      );
    });
  }, [realm, runGetPhoneContacts]);
  const myCustomers = getCustomers({realm});
  const keyExtractor = useCallback((item) => {
    if (!item) {
      return '';
    }
    return `${'_id' in item ? item._id + '-' : ''}${item.mobile}`;
  }, []);

  const data = useMemo(
    () => [
      ...orderBy(myCustomers, ['debtLevel', 'name'] as (keyof ICustomer)[], [
        'desc',
        'asc',
      ]),
      ...orderBy(phoneContacts, ['name'] as (keyof CustomerListItem)[], [
        'asc',
      ]),
    ],
    [myCustomers, phoneContacts],
  );
  const {youGave} = useTransaction();
  console.log('render');
  const handleSelectCustomer = useCallback(
    (customer?: ICustomer) => {
      getAnalyticsService()
        .logEvent('selectContent', {
          item_id: customer?._id?.toString() ?? '',
          content_type: 'customer',
        })
        .then(() => {});
      youGave({customer})
        .then(() => {
          closeModal();
        })
        .catch(handleError);
    },
    [closeModal, youGave],
  );

  const renderCustomerListItem = useCallback(
    ({
      item: customer,
      onPress,
    }: Pick<ListRenderItemInfo<CustomerListItem | null>, 'item'> & {
      onPress?: () => void;
    }) => {
      return (
        <Touchable
          onPress={() => {
            onPress?.();
            handleSelectCustomer(customer);
          }}>
          <View
            style={applyStyles(
              'flex-row items-center border-b-1 border-gray-20 p-16',
            )}>
            <PlaceholderImage text={customer?.name ?? ''} />
            <View style={applyStyles('flex-1 ml-8')}>
              <Text
                style={applyStyles('text-sm text-700 text-gray-300 uppercase')}>
                {customer.name}
              </Text>
            </View>
            <View>
              <Text style={applyStyles('text-sm text-400 text-gray-300')}>
                {customer.mobile}
              </Text>
            </View>
          </View>
        </Touchable>
      );
    },
    [handleSelectCustomer],
  );
  return (
    <Page
      header={{
        title: 'Select Customer',
        iconLeft: {
          iconName: 'x',
          onPress: () => {
            closeModal();
          },
        },
      }}
      style={applyStyles('px-0 py-0')}>
      <FlatList
        renderItem={renderCustomerListItem}
        keyExtractor={keyExtractor}
        data={data}
      />
    </Page>
  );
};
