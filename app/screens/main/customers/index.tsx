import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {useRealm} from '../../../services/realm';
import {ICustomer} from '../../../models';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {FAButton} from '../../../components';
import Icon from '../../../components/Icon';
import Touchable from '../../../components/Touchable';
import {colors} from '../../../styles';
import {applyStyles} from '../../../helpers/utils';

const CustomersTab = () => {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const customers = realm.objects<ICustomer>('Customer');

  const [searchInputValue, setSearchInputValue] = useState('');
  const [myCustomers, setMyCustomers] = useState(customers);

  const handleSelectCustomer = useCallback(
    (item?: Customer) => {
      navigation.navigate('CustomerDetails', {customer: item});
      setSearchInputValue('');
      setMyCustomers(customers);
    },
    [navigation, customers],
  );

  const handleCustomerSearch = useCallback(
    (searchedText: string) => {
      const sort = (item: Customer, text: string) => {
        return item.name.toLowerCase().indexOf(text.toLowerCase()) > -1;
      };
      var ac = customers.filter((item: Customer) => {
        return sort(item, searchedText);
      });
      setMyCustomers(ac);
      setTimeout(() => {
        setSearchInputValue(searchedText);
      }, 0);
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

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            size={24}
            style={styles.searchInputIcon}
            type="ionicons"
            name="ios-search"
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
      <FlatList
        data={myCustomers}
        renderItem={renderCustomerListItem}
        ListHeaderComponent={renderCustomerListHeader}
        keyExtractor={(item, index) => `${item.id}-${index}`}
      />
      <FAButton
        style={styles.fabButton}
        onPress={() => navigation.navigate('AddCustomer')}>
        <View style={styles.fabButtonContent}>
          <Icon
            size={18}
            type="ionicons"
            name={
              Platform.select({
                android: 'md-add',
                ios: 'ios-add',
              }) as string
            }
            color="white"
          />
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
