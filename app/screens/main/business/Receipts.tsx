import React, {useState, useCallback} from 'react';
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
import {useRealm} from '../../../services/realm';
import {ICustomer} from '../../../models';
import {colors} from '../../../styles';
import {applyStyles} from '../../../helpers/utils';
import {Button} from '../../../components';
import {getCustomers} from '../../../services/CustomerService';

const Receipts = (props) => {
  const {onCustomerSelect, onModalClose} = props;
  //@ts-ignore
  global.startTime = new Date().getTime();
  const realm = useRealm() as Realm;
  const customers = getCustomers({realm});

  const [searchInputValue, setSearchInputValue] = useState('');
  const [myCustomers, setMyCustomers] = useState(customers);

  const handleSelectCustomer = useCallback(
    (item?: Customer) => {
      onCustomerSelect({customer: item});
      setSearchInputValue('');
      setMyCustomers(customers);
    },
    [customers, onCustomerSelect],
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

  const handleCloseModal = useCallback(() => {
    onModalClose();
  }, []);

  const renderCustomerListItem = useCallback(
    ({item: customer}: CustomerItemProps) => {
      return (
        <Touchable onPress={() => handleSelectCustomer(customer)}>
          <View style={styles.customerListItem}>
            <Text style={applyStyles(styles.customerListItemText, 'text-400')}>
              {customer.name}
            </Text>
          </View>
        </Touchable>
      );
    },
    [handleSelectCustomer],
  );

  const renderCustomerListHeader = useCallback(
    () => (
      <Text style={applyStyles(styles.customerListHeader, 'text-500')}>
        Select a customer
      </Text>
    ),
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
            style={applyStyles(styles.searchInput, 'text-400')}
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
      <Button title="Close" variantColor="white" onPress={handleCloseModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  newCustomerButton: {
    height: 60,
    borderTopWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
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
});

export default Receipts;
