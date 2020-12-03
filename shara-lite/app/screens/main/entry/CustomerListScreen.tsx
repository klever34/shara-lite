import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Page} from '@/components/Page';
import {FlatList, View, Text, ListRenderItemInfo} from 'react-native';
import {getContactService} from '@/services';
import {useAsync} from '@/services/api';
import {useRealm} from '@/services/realm';
import {getCustomers} from '@/services/customer';
import orderBy from 'lodash/orderBy';
import {ICustomer} from '@/models';
import Touchable from '@/components/Touchable';
import {applyStyles} from '@/styles';
import PlaceholderImage from '@/components/PlaceholderImage';

type CustomerListItem =
  | Pick<ICustomer, 'name' | 'mobile' | '_id'>
  | {
      name: string;
      mobile?: string;
    };
const getPhoneContactsPromiseFn = () => getContactService().getPhoneContacts();

type CustomerListScreenProps = {
  onClose: () => void;
  onSelectCustomer: (customer: CustomerListItem) => void;
};

export const CustomerListScreen = ({
  onClose,
  onSelectCustomer,
}: CustomerListScreenProps) => {
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
            customer && onSelectCustomer(customer);
          }}>
          <View
            style={applyStyles(
              'flex-row items-center border-b-1 border-gray-20 p-16',
            )}>
            <PlaceholderImage text={customer?.name ?? ''} />
            <View style={applyStyles('flex-1 ml-8')}>
              <Text
                style={applyStyles('text-sm text-700 text-gray-300 uppercase')}>
                {customer?.name}
              </Text>
            </View>
            <View>
              <Text style={applyStyles('text-sm text-400 text-gray-300')}>
                {customer?.mobile}
              </Text>
            </View>
          </View>
        </Touchable>
      );
    },
    [onSelectCustomer],
  );
  return (
    <Page
      header={{
        title: 'Select Customer',
        iconLeft: {
          iconName: 'x',
          onPress: onClose,
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
