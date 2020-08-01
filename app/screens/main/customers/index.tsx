import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState, useEffect} from 'react';
import {FlatList, StyleSheet, Text, TextInput, View} from 'react-native';
import {FAButton} from '../../../components';
import EmptyState from '../../../components/EmptyState';
import Icon from '../../../components/Icon';
import Touchable from '../../../components/Touchable';
import {applyStyles} from '../../../helpers/utils';
import {ICustomer} from '../../../models';
import {getCustomers} from '../../../services/CustomerService';
import {useRealm} from '../../../services/realm';
import {colors} from '../../../styles';

const CustomersTab = () => {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const customers = getCustomers({realm});

  const [searchInputValue, setSearchInputValue] = useState('');
  const [myCustomers, setMyCustomers] = useState<ICustomer[]>(customers);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const customers = getCustomers({realm});
      setMyCustomers(customers);
    });
    return unsubscribe;
  }, [navigation, realm]);

  const handleSelectCustomer = useCallback(
    (item?: ICustomer) => {
      navigation.navigate('CustomerDetails', {customer: item});
      setSearchInputValue('');
      setMyCustomers(customers);
    },
    [navigation, customers],
  );

  const handleCustomerSearch = useCallback(
    (searchedText: string) => {
      setSearchInputValue(searchedText);
      if (searchedText) {
        const sort = (item: ICustomer, text: string) => {
          return item.name.toLowerCase().indexOf(text.toLowerCase()) > -1;
        };
        const ac = customers.filter((item: ICustomer) => {
          return sort(item, searchedText);
        });
        setMyCustomers(ac);
      } else {
        setMyCustomers(customers);
      }
    },
    [customers],
  );

  const renderCustomerListItem = useCallback(
    ({item: customer}: CustomerItemProps) => {
      return (
        <Touchable onPress={() => handleSelectCustomer(customer)}>
          <View style={styles.customerListItem}>
            <Text style={styles.customerListItemText}>{customer.name}</Text>
          </View>
        </Touchable>
      );
    },
    [handleSelectCustomer],
  );

  const renderCustomerListHeader = useCallback(
    () => <Text style={styles.customerListHeader}>Select a customer</Text>,
    [],
  );

  if (!customers.length) {
    return (
      <>
        <EmptyState
          heading="Add a customer"
          source={require('../../../assets/images/coming-soon.png')}
          text="Click the button below to add a new customer"
        />
        <FAButton
          style={styles.fabButton}
          onPress={() => navigation.navigate('AddCustomer')}>
          <View style={styles.fabButtonContent}>
            <Icon size={18} name="plus" color="white" type="feathericons" />
            <Text style={applyStyles(styles.fabButtonText, 'text-400')}>
              Add Customer
            </Text>
          </View>
        </FAButton>
      </>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            size={24}
            name="search"
            type="feathericons"
            style={styles.searchInputIcon}
            color={colors.primary}
          />
          <TextInput
            value={searchInputValue}
            style={styles.searchInput}
            placeholder="Search Customer"
            onChangeText={handleCustomerSearch}
            placeholderTextColor={colors['gray-50']}
          />
        </View>
      </View>

      {myCustomers.length ? (
        <>
          <FlatList
            data={myCustomers}
            renderItem={renderCustomerListItem}
            keyExtractor={(item) => `${item.id}`}
            ListHeaderComponent={renderCustomerListHeader}
          />
        </>
      ) : (
        <EmptyState
          heading="No results found"
          text="Click the button below to add a new customer"
        />
      )}
      <FAButton
        style={styles.fabButton}
        onPress={() => navigation.navigate('AddCustomer')}>
        <View style={styles.fabButtonContent}>
          <Icon size={18} name="plus" color="white" type="feathericons" />
          <Text style={applyStyles(styles.fabButtonText, 'text-400')}>
            Add Customer
          </Text>
        </View>
      </FAButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  searchContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
  },
  searchInputContainer: {
    position: 'relative',
  },
  searchInputIcon: {
    top: 12,
    left: 10,
    elevation: 3,
    position: 'absolute',
  },
  searchInput: {
    height: 48,
    elevation: 2,
    fontSize: 16,
    borderRadius: 8,
    paddingLeft: 36,
    backgroundColor: colors.white,
  },
  customerListHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    textTransform: 'uppercase',
    color: colors['gray-300'],
    borderBottomColor: colors['gray-20'],
  },
  customerListItem: {
    fontSize: 16,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-20'],
  },
  customerListItemText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
  fabButton: {
    height: 48,
    width: 'auto',
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabButtonText: {
    fontSize: 16,
    paddingLeft: 8,
    color: colors.white,
    textTransform: 'uppercase',
  },
});

export default CustomersTab;
