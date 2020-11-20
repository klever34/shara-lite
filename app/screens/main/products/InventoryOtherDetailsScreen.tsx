import {
  AppInput,
  AutoComplete,
  Button,
  PhoneNumber,
  PhoneNumberField,
  RadioButton,
} from '@/components';
import {Page} from '@/components/Page';
import Touchable from '@/components/Touchable';
import {showToast} from '@/helpers/utils';
import {ISupplier} from '@/models/Supplier';
import {getAnalyticsService, getContactService} from '@/services';
import {useAsync} from '@/services/api';
import {useErrorHandler} from '@/services/error-boundary';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {addNewInventory} from '@/services/ReceivedInventoryService';
import {getSuppliers, saveSupplier} from '@/services/SupplierService';
import {applyStyles} from '@/styles';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, SafeAreaView, Text, View} from 'react-native';
import {useReceiptProvider} from '../receipts/ReceiptProvider';

type SupplierListItem =
  | Pick<ISupplier, 'name' | 'mobile' | '_id'>
  | {
      name: string;
      mobile?: string;
    };

export const InventoryOtherDetailsScreen = () => {
  const realm = useRealm() as Realm;
  const navigation = useAppNavigation();
  const suppliers = getSuppliers({realm});
  const contactService = getContactService();
  const getPhoneContactsPromiseFn = () => contactService.getPhoneContacts();

  const {callingCode} = useIPGeolocation();
  const {inventoryStock, handleClearInventoryStock} = useReceiptProvider();
  const {run: runGetPhoneContacts} = useAsync(getPhoneContactsPromiseFn, {
    defer: true,
  });

  const [note, setNote] = useState('');
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  const [saveToPhoneBook, setSaveToPhoneBook] = useState(true);
  const [countryCode, setCountryCode] = useState(callingCode || '');
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [allSuppliers, setAllSuppliers] = useState<SupplierListItem[]>([]);
  const [supplier, setSupplier] = useState<ISupplier | undefined>();

  const handleError = useErrorHandler();

  const handleClearState = useCallback(() => {
    setNote('');
    setMobile('');
    setSupplier({} as ISupplier);
    setSupplierSearchQuery('');
  }, []);

  const handleGoBack = useCallback(() => {
    handleClearState();
    navigation.goBack();
  }, [navigation, handleClearState]);

  const handleSupplierSearch = useCallback((item: ISupplier, text: string) => {
    return (
      `${item.name}`.toLowerCase().indexOf(text.toLowerCase()) > -1 ||
      `${item.mobile}`.toLowerCase().indexOf(text.toLowerCase()) > -1
    );
  }, []);

  const handleSelectCustomer = useCallback(
    (item: ISupplier) => {
      let selected = item;
      if (!selected?._id?.toString()) {
        selected = saveSupplier({realm, supplier: item});
      }
      setSupplierSearchQuery(selected.name);
      setSupplier(selected);
    },
    [realm],
  );

  const handleChangeSearchQuery = useCallback((searchValue) => {
    setSupplierSearchQuery(searchValue);
  }, []);

  const handleNoteChange = useCallback((text: string) => {
    setNote(text);
  }, []);

  const handleSaveToPhoneBookChange = useCallback((checked: boolean) => {
    setSaveToPhoneBook(checked);
  }, []);

  const handleChangeMobile = (value: PhoneNumber) => {
    setMobile(value.number);
    setCountryCode(value.callingCode);
    if (isNewSupplier) {
      setSupplier({
        name: supplierSearchQuery,
        mobile: `+${value.callingCode}${value.number}`,
      });
    }
  };

  const handleFinish = useCallback(() => {
    let payload: any = {
      supplier,
      stockItems: inventoryStock,
    };
    setIsLoading(true);

    setTimeout(async () => {
      if (isNewSupplier && saveToPhoneBook) {
        try {
          await contactService.addContact({
            givenName: supplier?.name ?? '',
            phoneNumbers: [
              {
                label: 'mobile',
                number: supplier?.mobile ?? '',
              },
            ],
          });
        } catch (error) {
          Alert.alert('Error', error);
        }
      }
      setIsLoading(true);
      const newSupplier = saveSupplier({
        realm,
        supplier: {name: supplier?.name ?? '', mobile: supplier?.mobile},
      });
      payload.supplier = newSupplier;
      addNewInventory({
        realm,
        ...payload,
      });
      setIsLoading(false);

      getAnalyticsService()
        .logEvent('inventoryReceived', {})
        .catch(handleError);

      handleClearState();
      handleClearInventoryStock();
      showToast({message: 'INVENTORY RECEIVED SUCCESSFULLY'});

      navigation.navigate('ProductsTab');
    }, 100);
  }, [
    supplier,
    inventoryStock,
    isNewSupplier,
    saveToPhoneBook,
    realm,
    handleError,
    handleClearState,
    navigation,
    contactService,
    handleClearInventoryStock,
  ]);

  const renderSearchDropdownItem = useCallback(({item, onPress}) => {
    return (
      <Touchable onPress={() => onPress(item)}>
        <View style={applyStyles('p-16 flex-row items-center justify-between')}>
          <Text style={applyStyles('text-700 text-base text-gray-300')}>
            {item.name}
          </Text>
          <Text style={applyStyles('text-400 text-base text-gray-300')}>
            {item?.mobile}
          </Text>
        </View>
      </Touchable>
    );
  }, []);

  useEffect(() => {
    runGetPhoneContacts().then((contacts) => {
      setAllSuppliers([
        ...suppliers,
        ...contacts.reduce<SupplierListItem[]>(
          (acc, {givenName, familyName, phoneNumber}) => {
            const existing = suppliers.filtered(
              `mobile = "${phoneNumber.number}"`,
            );
            if (existing.length) {
              return acc;
            }
            return [
              ...acc,
              {
                name: `${givenName} ${familyName}`,
                mobile: phoneNumber.number,
              },
            ];
          },
          [],
        ),
      ]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={applyStyles('flex-1 bg-white')}>
      <Page
        header={{
          title: 'Other details',
          iconLeft: {iconName: 'arrow-left', onPress: handleGoBack},
        }}>
        <View style={applyStyles('pt-24')}>
          <AutoComplete<SupplierListItem>
            rightIcon="users"
            items={allSuppliers}
            value={supplierSearchQuery}
            setFilter={handleSupplierSearch}
            onItemSelect={handleSelectCustomer}
            renderItem={renderSearchDropdownItem}
            onChangeText={handleChangeSearchQuery}
            label="Select or add supplier (optional)"
            inputStyle={applyStyles('mb-16 bg-gray-10')}
            noResultsAction={() => setIsNewSupplier(true)}
            textInputProps={{placeholder: 'Search or add a supplier'}}
          />
          {isNewSupplier && (
            <>
              <PhoneNumberField
                label="phone number?"
                placeholder="Enter phone number"
                containerStyle={applyStyles('mb-24')}
                onChangeText={(data) => handleChangeMobile(data)}
                value={{number: mobile, callingCode: countryCode}}
              />

              <RadioButton
                isChecked={saveToPhoneBook}
                containerStyle={applyStyles('py-16 mb-24 center')}
                onChange={handleSaveToPhoneBookChange}>
                <Text style={applyStyles('text-400 text-gray-300')}>
                  Save to Phonebook
                </Text>
              </RadioButton>
            </>
          )}
          <AppInput
            multiline
            value={note}
            label="Notes (optional)"
            onChangeText={handleNoteChange}
            style={applyStyles('pt-0 mb-16', {height: 96})}
            placeholder="Any other information about this transaction?"
          />
          <Button
            title="Finish"
            variantColor="red"
            isLoading={isLoading}
            onPress={handleFinish}
            style={applyStyles('w-full')}
          />
        </View>
      </Page>
    </SafeAreaView>
  );
};
