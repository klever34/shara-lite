import React, {useCallback, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Button} from '../../../../components';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {applyStyles} from '../../../../helpers/utils';
import {ICustomer} from '../../../../models';
import {colors} from '../../../../styles';

type CustomerItemProps = {
  item: ICustomer;
};

type Props = {
  customers: ICustomer[];
  onModalClose: () => void;
  showAddFromPhone?: boolean;
  onOpenContactList?: () => void;
  onCustomerSelect: ({customer}: {customer?: ICustomer}) => void;
};

export const CustomersList = (props: Props) => {
  const {
    customers,
    onModalClose,
    onCustomerSelect,
    onOpenContactList,
    showAddFromPhone = true,
  } = props;

  const [searchInputValue, setSearchInputValue] = useState('');
  const [myCustomers, setMyCustomers] = useState(customers);

  const handleCustomerSearch = useCallback(
    (searchedText: string) => {
      setSearchInputValue(searchedText);
      const sort = (item: ICustomer, text: string) => {
        return item.name.toLowerCase().indexOf(text.toLowerCase()) > -1;
      };
      var ac = customers.filter((item: ICustomer) => {
        return sort(item, searchedText);
      });
      setMyCustomers(ac);
    },
    [customers],
  );

  const handleCloseModal = useCallback(() => {
    onModalClose();
  }, [onModalClose]);

  const handleSelectCustomer = useCallback(
    (item?: ICustomer) => {
      onCustomerSelect({customer: item});
      setSearchInputValue('');
      setMyCustomers(customers);
      handleCloseModal();
    },
    [customers, onCustomerSelect, handleCloseModal],
  );

  const renderCustomerListItem = useCallback(
    ({item: customer}: CustomerItemProps) => {
      return (
        <Touchable onPress={() => handleSelectCustomer(customer)}>
          <View style={styles.customerListItem}>
            <Text
              style={applyStyles(
                styles.customerListItemText,
                'pb-xs',
                'text-400',
              )}>
              {customer.name}
            </Text>
            <Text style={applyStyles({color: colors['gray-300']}, 'text-400')}>
              {customer.mobile}
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
        Your customers
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
            type="feathericons"
            name="search"
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
      {showAddFromPhone && (
        <Touchable onPress={onOpenContactList}>
          <View
            style={applyStyles('flex-row px-lg py-lg items-center', {
              borderBottomWidth: 1,
              borderBottomColor: colors['gray-20'],
            })}>
            <Icon
              size={24}
              name="user-plus"
              type="feathericons"
              color={colors.primary}
            />
            <Text
              style={applyStyles('text-400 pl-md', {
                fontSize: 16,
                color: colors['gray-300'],
              })}>
              Add From Phonebook
            </Text>
          </View>
        </Touchable>
      )}
      <FlatList
        data={myCustomers}
        renderItem={renderCustomerListItem}
        ListHeaderComponent={renderCustomerListHeader}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        ListEmptyComponent={
          <View
            style={applyStyles('flex-1', 'items-center', 'justify-center', {
              paddingVertical: 40,
            })}>
            <Text
              style={applyStyles('heading-700', 'text-center', {
                color: colors['gray-300'],
              })}>
              No results found
            </Text>
          </View>
        }
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
    color: colors.primary,
  },
});
