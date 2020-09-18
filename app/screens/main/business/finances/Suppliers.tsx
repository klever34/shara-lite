import {ContactsListModal, FAButton} from '@/components';
import {useNavigation} from '@react-navigation/native';
import orderBy from 'lodash/orderBy';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {Contact} from 'react-native-contacts';
import EmptyState from '../../../../components/EmptyState';
import HeaderRight from '../../../../components/HeaderRight';
import Icon from '../../../../components/Icon';
import TextInput from '../../../../components/TextInput';
import Touchable from '../../../../components/Touchable';
import {applyStyles} from '@/helpers/utils';
import {ISupplier} from '@/models/Supplier';
import {useScreenRecord} from '@/services/analytics';
import {useRealm} from '@/services/realm';
import {getSuppliers, saveSupplier} from '@/services/SupplierService';
import {colors} from '@/styles';
import {getAnalyticsService} from '@/services';

type SupplierItemProps = {
  item: ISupplier;
};

export const Suppliers = () => {
  useScreenRecord();
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const suppliers = getSuppliers({realm});

  const [searchInputValue, setSearchInputValue] = useState('');
  const [mySuppliers, setMySuppliers] = useState<ISupplier[]>(suppliers);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

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

  const handleSupplierSearch = useCallback(
    (searchedText: string) => {
      setSearchInputValue(searchedText);
      if (searchedText) {
        const searchValue = searchedText.trim();
        const sort = (item: ISupplier, text: string) => {
          return item.name.toLowerCase().indexOf(text.toLowerCase()) > -1;
        };
        const ac = suppliers.filter((item: ISupplier) => {
          return sort(item, searchValue);
        });
        setMySuppliers(ac);
      } else {
        setMySuppliers(suppliers);
      }
      getAnalyticsService()
        .logEvent('search', {
          search_term: searchedText,
          content_type: 'supplier',
        })
        .then(() => {});
    },
    [suppliers],
  );

  const handleAddSupplier = useCallback(() => {
    navigation.navigate('AddSupplier');
  }, [navigation]);

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

  const renderSupplierListItem = useCallback(
    ({item: supplier}: SupplierItemProps) => {
      return (
        <Touchable onPress={() => {}}>
          <View style={styles.supplierListItem}>
            <Text style={styles.supplierListItemText}>{supplier.name}</Text>
          </View>
        </Touchable>
      );
    },
    [],
  );

  const renderSupplierListHeader = useCallback(
    () => <Text style={styles.supplierListHeader}>Select a supplier</Text>,
    [],
  );

  return (
    <View style={applyStyles('flex-1', {backgroundColor: colors.white})}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            size={24}
            name="search"
            type="feathericons"
            color={colors.primary}
            style={styles.searchInputIcon}
          />
          <TextInput
            value={searchInputValue}
            containerStyle={styles.searchInput}
            placeholder="Search Suppliers"
            onChangeText={handleSupplierSearch}
            placeholderTextColor={colors['gray-50']}
          />
        </View>
      </View>
      <FlatList
        renderItem={renderSupplierListItem}
        keyExtractor={(item) => `${item._id}`}
        data={orderBy(mySuppliers, 'name', 'asc')}
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
      <FAButton style={styles.fabButton} onPress={handleOpenContactListModal}>
        <View style={styles.fabButtonContent}>
          <Icon size={18} name="plus" color="white" type="feathericons" />
          <Text style={applyStyles(styles.fabButtonText, 'text-400')}>
            Create supplier
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
    borderBottomColor: colors['gray-20'],
  },
  supplierListItemText: {
    fontSize: 16,
    color: colors['gray-300'],
    fontFamily: 'Rubik-Regular',
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
