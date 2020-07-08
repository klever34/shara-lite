import {useNavigation} from '@react-navigation/native';
import React, {useState, useCallback, useLayoutEffect} from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from '../../../components/Icon';
import AppMenu from '../../../components/Menu';
import Touchable from '../../../components/Touchable';
import {colors} from '../../../styles';
import {customers} from './data.json';

const Receipts = () => {
  //@ts-ignore
  global.startTime = new Date().getTime();
  const navigation = useNavigation();
  const [searchInputValue, setSearchInputValue] = useState('');
  const [myCustomers, setMyCustomers] = useState(customers);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <AppMenu options={[]} />,
    });
  }, [navigation]);

  const handleSelectCustomer = useCallback(
    (item?: Customer) => {
      navigation.navigate('NewReceipt', {customer: item});
      setSearchInputValue('');
      setMyCustomers(customers);
    },
    [navigation],
  );

  const handleCustomerSearch = useCallback((searchedText: string) => {
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
  }, []);

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
    <SafeAreaView style={styles.container}>
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
      <Touchable onPress={() => handleSelectCustomer()}>
        <View style={styles.newCustomerButton}>
          <Icon
            size={24}
            name="user-plus"
            type="feathericons"
            color={colors.primary}
          />
          <Text style={styles.newCustomerButtonText}>New Customer</Text>
        </View>
      </Touchable>
      <FlatList
        data={myCustomers}
        renderItem={renderCustomerListItem}
        ListHeaderComponent={renderCustomerListHeader}
        keyExtractor={(item, index) => `${item.id}-${index}`}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    padding: 8,
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
  newCustomerButton: {
    height: 60,
    borderTopWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    borderTopColor: colors['gray-20'],
    borderBottomColor: colors['gray-20'],
  },
  newCustomerButtonText: {
    fontSize: 16,
    paddingLeft: 12,
    color: colors['gray-300'],
  },
  customerListHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    textTransform: 'uppercase',
    color: colors['gray-300'],
    borderBottomColor: colors['gray-20'],
  },
  customerListItem: {
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-20'],
  },
  customerListItemText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
});

export default Receipts;
