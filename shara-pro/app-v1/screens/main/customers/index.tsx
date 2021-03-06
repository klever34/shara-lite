import {ContactsListModal, FAButton} from 'app-v1/components';
import EmptyState from 'app-v1/components/EmptyState';
import Icon from 'app-v1/components/Icon';
import Touchable from 'app-v1/components/Touchable';
import {applyStyles} from 'app-v1/helpers/utils';
import {ICustomer} from 'app-v1/models';
import {getAnalyticsService} from 'app-v1/services';
import {getCustomers, saveCustomer} from 'app-v1/services/customer/service';
import {useRealm} from 'app-v1/services/realm';
import {colors} from 'app-v1/styles';
import {useNavigation} from '@react-navigation/native';
import orderBy from 'lodash/orderBy';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import {Contact} from 'react-native-contacts';

type CustomerItemProps = {
  item: ICustomer;
};

const CustomersTab = () => {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const customers = getCustomers({realm});
  const analyticsService = getAnalyticsService();

  const [searchInputValue, setSearchInputValue] = useState('');
  const [myCustomers, setMyCustomers] = useState<ICustomer[]>(customers);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const customersData = getCustomers({realm});
      setMyCustomers(customersData);
    });
  }, [navigation, realm]);

  const handleOpenContactListModal = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setIsContactListModalOpen(false);
  }, []);

  const handleSelectCustomer = useCallback(
    (item?: ICustomer) => {
      analyticsService
        .logEvent('selectContent', {
          item_id: item?._id?.toString() ?? '',
          content_type: 'customer',
        })
        .then(() => {});
      navigation.navigate('CustomerDetails', {customer: item});
      setSearchInputValue('');
      setMyCustomers(customers);
    },
    [navigation, customers, analyticsService],
  );

  const handleCreateCustomer = useCallback(
    (contact: Contact) => {
      const mobile = contact.phoneNumbers[0].number;
      const name = `${contact.givenName} ${contact.familyName}`;

      if (customers.map((item) => item.mobile).includes(mobile)) {
        Alert.alert(
          'Info',
          'Customer with the same phone number has been created.',
        );
      } else {
        const customer = {
          name,
          mobile,
        };
        saveCustomer({realm, customer});
        ToastAndroid.show('Customer added', ToastAndroid.SHORT);
      }
    },
    [customers, realm],
  );

  const handleCustomerSearch = useCallback(
    (searchedText: string) => {
      setSearchInputValue(searchedText);
      if (searchedText) {
        const searchValue = searchedText.trim();
        const sort = (item: ICustomer, text: string) => {
          return item.name.toLowerCase().indexOf(text.toLowerCase()) > -1;
        };
        const ac = customers.filter((item: ICustomer) => {
          return sort(item, searchValue);
        });
        setMyCustomers(ac);
      } else {
        setMyCustomers(customers);
      }
      analyticsService
        .logEvent('search', {
          search_term: searchedText,
          content_type: 'customer',
        })
        .then(() => {});
    },
    [analyticsService, customers],
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
          style={applyStyles(
            'h-48 w-auto rounded-16 px-12 flex-row items-center',
          )}
          onPress={handleOpenContactListModal}>
          <Icon size={18} name="plus" color="white" type="feathericons" />
          <Text
            style={applyStyles('text-400 text-base ml-8 text-white uppercase')}>
            Add Customer
          </Text>
        </FAButton>
        <ContactsListModal<ICustomer>
          entity="Customer"
          createdData={customers}
          visible={isContactListModalOpen}
          onClose={handleCloseContactListModal}
          onAddNew={() => navigation.navigate('AddCustomer')}
          onContactSelect={(contact) => handleCreateCustomer(contact)}
        />
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
            renderItem={renderCustomerListItem}
            keyExtractor={(item) => `${item._id}`}
            data={orderBy(myCustomers, 'name', 'asc')}
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
        style={applyStyles(
          'h-48 w-auto rounded-16 px-12 flex-row items-center',
        )}
        onPress={handleOpenContactListModal}>
        <Icon size={18} name="plus" color="white" type="feathericons" />
        <Text
          style={applyStyles('text-400 text-base ml-8 text-white uppercase')}>
          Add Customer
        </Text>
      </FAButton>

      <ContactsListModal<ICustomer>
        entity="Customer"
        createdData={customers}
        visible={isContactListModalOpen}
        onClose={handleCloseContactListModal}
        onAddNew={() => navigation.navigate('AddCustomer')}
        onContactSelect={(contact) => handleCreateCustomer(contact)}
      />
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
    fontFamily: 'Rubik-Regular',
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
    fontFamily: 'Rubik-Regular',
  },
});

export default CustomersTab;
