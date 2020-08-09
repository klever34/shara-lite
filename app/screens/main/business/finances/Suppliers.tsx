import React, {useState, useEffect, useCallback, useLayoutEffect} from 'react';
import {applyStyles} from '../../../../helpers/utils';
import {colors} from '../../../../styles';
import {StyleSheet, View, Text, FlatList} from 'react-native';
import Icon from '../../../../components/Icon';
import TextInput from '../../../../components/TextInput';
import {useNavigation} from '@react-navigation/native';
import {useRealm} from '../../../../services/realm';
import Touchable from '../../../../components/Touchable';
import EmptyState from '../../../../components/EmptyState';
import {getSuppliers} from '../../../../services/SupplierService';
import {ISupplier} from '../../../../models/Supplier';
import HeaderRight from '../../../../components/HeaderRight';

type SupplierItemProps = {
  item: ISupplier;
};

export const Suppliers = () => {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const suppliers = getSuppliers({realm});

  const [searchInputValue, setSearchInputValue] = useState('');
  const [mySuppliers, setMySuppliers] = useState<ISupplier[]>(suppliers);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const suppliersData = getSuppliers({realm});
      setMySuppliers(suppliersData);
    });
    return unsubscribe;
  }, [navigation, realm]);

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
            style={styles.searchInput}
            placeholder="Search Suppliers"
            onChangeText={handleSupplierSearch}
            placeholderTextColor={colors['gray-50']}
          />
        </View>
      </View>
      <Touchable onPress={handleAddSupplier}>
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
        keyExtractor={(item) => `${item.id}`}
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
  },
});
