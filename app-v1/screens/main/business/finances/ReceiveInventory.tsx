import React, {useCallback, useEffect, useState} from 'react';
import {applyStyles} from 'app-v1/helpers/utils';
import {colors} from 'app-v1/styles';
import EmptyState from '../../../../components/EmptyState';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import Icon from '../../../../components/Icon';
import {useNavigation} from '@react-navigation/native';
import {useRealm} from 'app-v1/services/realm';
import Touchable from '../../../../components/Touchable';
import {ISupplier} from 'app-v1/models/Supplier';
import {getSuppliers, saveSupplier} from 'app-v1/services/SupplierService';
import {ContactsListModal} from 'app-v1/components';
import {Contact} from 'react-native-contacts';
import {getAnalyticsService} from 'app-v1/services';

type SupplierItemProps = {
  item: ISupplier;
};

export const ReceiveInventory = () => {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const suppliers = getSuppliers({realm});
  const analyticsService = getAnalyticsService();

  const [searchInputValue, setSearchInputValue] = useState('');
  const [mySuppliers, setMySuppliers] = useState<ISupplier[]>(suppliers);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const suppliersData = getSuppliers({realm});
      setMySuppliers(suppliersData);
    });
  }, [navigation, realm]);

  const handleOpenContactListModal = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setIsContactListModalOpen(false);
  }, []);

  const handleSelectSupplier = useCallback(
    (item?: ISupplier) => {
      navigation.navigate('ReceiveInventoryStock', {supplier: item});
      setSearchInputValue('');
      setMySuppliers(suppliers);
      analyticsService
        .logEvent('selectContent', {
          item_id: item?._id?.toString() ?? '',
          content_type: 'supplier',
        })
        .then(() => {});
    },
    [navigation, suppliers, analyticsService],
  );

  const handleSupplierSearch = useCallback(
    (searchedText: string) => {
      setSearchInputValue(searchedText);
      if (searchedText) {
        const sort = (item: ISupplier, text: string) => {
          return item.name.toLowerCase().indexOf(text.toLowerCase()) > -1;
        };
        const ac = suppliers.filter((item: ISupplier) => {
          return sort(item, searchedText);
        });
        setMySuppliers(ac);
      } else {
        setMySuppliers(suppliers);
      }
      analyticsService
        .logEvent('search', {
          search_term: searchedText,
          content_type: 'supplier',
        })
        .then(() => {});
    },
    [suppliers, analyticsService],
  );

  const handleAddSupplier = useCallback(() => {
    navigation.navigate('AddSupplier');
  }, [navigation]);

  const renderSupplierListItem = useCallback(
    ({item: supplier}: SupplierItemProps) => {
      return (
        <Touchable onPress={() => handleSelectSupplier(supplier)}>
          <View style={styles.supplierListItem}>
            <Text style={styles.supplierListItemText}>{supplier.name}</Text>
          </View>
        </Touchable>
      );
    },
    [handleSelectSupplier],
  );

  const handleCreateSupplier = useCallback(
    (contact: Contact) => {
      const mobile = contact.phoneNumbers[0].number;
      const name = `${contact.givenName} ${contact.familyName}`;

      if (name) {
        if (suppliers.map((item) => item.mobile).includes(mobile)) {
          Alert.alert(
            'Info',
            'Supplier with the same phone number has been created.',
          );
        } else {
          const supplier = {name, mobile};
          saveSupplier({realm, supplier});
          ToastAndroid.show('Supplier added', ToastAndroid.SHORT);
        }
      }
    },
    [realm, suppliers],
  );

  const renderSupplierListHeader = useCallback(
    () => <Text style={styles.supplierListHeader}>Select a supplier</Text>,
    [],
  );

  return (
    <View style={applyStyles({backgroundColor: colors.white})}>
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
            placeholder="Search Suppliers"
            onChangeText={handleSupplierSearch}
            placeholderTextColor={colors['gray-50']}
          />
        </View>
      </View>
      <Touchable onPress={handleOpenContactListModal}>
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
            Add Supplier
          </Text>
        </View>
      </Touchable>
      <FlatList
        data={mySuppliers}
        renderItem={renderSupplierListItem}
        keyExtractor={(item) => `${item._id}`}
        ListHeaderComponent={renderSupplierListHeader}
        ListEmptyComponent={
          <EmptyState
            heading={
              !suppliers.length ? 'No Suppliers Added' : 'No results found'
            }
            source={require('../../../../assets/images/coming-soon.png')}
            text="Click on the add supplier button above to create a supplier"
          />
        }
      />
      <ContactsListModal<ISupplier>
        entity="Supplier"
        createdData={suppliers}
        onAddNew={handleAddSupplier}
        visible={isContactListModalOpen}
        onClose={handleCloseContactListModal}
        onContactSelect={(contact) => handleCreateSupplier(contact)}
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
  supplierListHeader: {
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
  supplierListItem: {
    fontSize: 16,
    padding: 16,
    borderBottomWidth: 1,
    fontFamily: 'Rubik-Regular',
    borderBottomColor: colors['gray-20'],
  },
  supplierListItemText: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    color: colors['gray-300'],
  },
});
