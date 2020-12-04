import {SearchFilter} from '@/components';
import {Page} from '@/components/Page';
import PlaceholderImage from '@/components/PlaceholderImage';
import Touchable from '@/components/Touchable';
import {ICustomer} from '@/models';
import {MainStackParamList} from '@/screens/main';
import {getContactService} from '@/services';
import {useAsync} from '@/services/api';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {applyStyles} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import * as JsSearch from 'js-search';
import orderBy from 'lodash/orderBy';
import throttle from 'lodash/throttle';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, ListRenderItemInfo, Text, View} from 'react-native';

export type SelectCustomerListItem =
  | Pick<ICustomer, 'name' | 'mobile' | '_id'>
  | {
      name: string;
      mobile?: string;
    };
const getPhoneContactsPromiseFn = () => getContactService().getPhoneContacts();

export type SelectCustomerListScreenParams = {
  onSelectCustomer: (customer: SelectCustomerListItem) => void;
};

export type SelectCustomerListScreenProps = {
  route: RouteProp<MainStackParamList, 'SelectCustomerList'>;
};

export const SelectCustomerListScreen = ({
  route,
}: SelectCustomerListScreenProps) => {
  const {onSelectCustomer} = route.params;
  const realm = useRealm();
  const [phoneContacts, setPhoneContacts] = useState<SelectCustomerListItem[]>(
    [],
  );
  const {run: runGetPhoneContacts} = useAsync(getPhoneContactsPromiseFn, {
    defer: true,
  });
  useEffect(() => {
    runGetPhoneContacts().then((contacts) => {
      setPhoneContacts(
        contacts.reduce<SelectCustomerListItem[]>(
          (acc, {givenName, familyName, phoneNumber}) => {
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
  const keyExtractor = useCallback((item) => {
    if (!item) {
      return '';
    }
    return `${'_id' in item ? item._id + '-' : ''}${item.mobile}`;
  }, []);

  const data = useMemo(
    () => [
      ...orderBy(phoneContacts, ['name'] as (keyof SelectCustomerListItem)[], [
        'asc',
      ]),
    ],
    [phoneContacts],
  );

  const renderCustomerListItem = useCallback(
    ({
      item: customer,
      onPress,
    }: Pick<ListRenderItemInfo<SelectCustomerListItem | null>, 'item'> & {
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
  const navigation = useAppNavigation();
  const [searchText, setSearchText] = useState('');
  const searchRef = useRef(new JsSearch.Search('mobile'));
  const [filteredData, setFilterData] = useState(data);
  useEffect(() => {
    const {current: search} = searchRef;
    search.addIndex('name');
    search.addIndex('mobile');
    search.addDocuments(data);
    setFilterData(data);
  }, [data]);

  const onSearch = useCallback(
    throttle((query: string) => {
      const {current: search} = searchRef;
      setSearchText(query);
      if (query) {
        setFilterData(search.search(query) as SelectCustomerListItem[]);
      } else {
        setFilterData(data);
      }
    }, 750),
    [data],
  );
  return (
    <Page
      header={{
        title: 'Select Customer',
        iconLeft: {
          iconName: 'x',
          onPress: navigation.goBack,
        },
      }}
      style={applyStyles('px-0 py-0')}>
      <SearchFilter
        placeholderText="Search customers on phonebook"
        value={searchText}
        onSearch={onSearch}
      />
      <FlatList
        renderItem={renderCustomerListItem}
        keyExtractor={keyExtractor}
        data={filteredData}
      />
    </Page>
  );
};
