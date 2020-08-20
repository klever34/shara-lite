import React, {useState, useEffect, useCallback} from 'react';
import {applyStyles} from '@/helpers/utils';
import {colors} from '@/styles';
import EmptyState from '../../../../components/EmptyState';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Alert,
  ToastAndroid,
} from 'react-native';
import Icon from '../../../../components/Icon';
import TextInput from '../../../../components/TextInput';
import {useNavigation} from '@react-navigation/native';
import {useRealm} from '@/services/realm';
import Touchable from '../../../../components/Touchable';
import {ISupplier} from '@/models/Supplier';
import {getSuppliers, saveSupplier} from '@/services/SupplierService';
import {useScreenRecord} from '@/services/analytics';
import {ContactsListModal} from '@/components';
import {Contact} from 'react-native-contacts';
import {getAnalyticsService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';

type SupplierItemProps = {
  item: ISupplier;
};

export const ReceiveInventory = () => {
  useScreenRecord();
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const suppliers = getSuppliers({realm});

  const [searchInputValue, setSearchInputValue] = useState('');
  const [mySuppliers, setMySuppliers] = useState<ISupplier[]>(suppliers);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const suppliersData = getSuppliers({realm});
      setMySuppliers(suppliersData);
    });
    return unsubscribe;
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
    },
    [navigation, suppliers],
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
    },
    [suppliers],
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

  const handleError = useErrorHandler();

  const handleCreateSupplier = useCallback(
    (contact: Contact) => {
      const mobile = contact.phoneNumbers[0].number;
      const name = `${contact.givenName} ${contact.familyName}`;

      if (name) {
        if (suppliers.map((item) => item.mobile).includes(mobile)) {
          Alert.alert(
            'Error',
            'Supplier with the same phone number has been created.',
          );
        } else {
          const supplier = {name, mobile};
          saveSupplier({realm, supplier});
          getAnalyticsService().logEvent('supplierAdded').catch(handleError);
          ToastAndroid.show('Supplier added', ToastAndroid.SHORT);
        }
      }
    },
    [realm, suppliers, handleError],
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
      <ContactsListModal
        entity="Supplier"
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
