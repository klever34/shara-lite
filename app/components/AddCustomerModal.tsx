import {Button} from '@/components';
import {showToast} from '@/helpers/utils';
import {BottomHalfModalContainer} from '@/modals/BottomHalfModal';
import {ICustomer} from '@/models';
import {getContactService} from '@/services';
import {useAsync} from '@/services/api';
import {getCustomers} from '@/services/customer';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {useRealm} from '@/services/realm';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {AutoComplete} from './AutoComplete';
import {PhoneNumber, PhoneNumberField} from './PhoneNumberField';
import {RadioButton} from './RadioButton';
import Touchable from './Touchable';

type Props = {
  visible: boolean;
  onClose: () => void;
  customer?: ICustomer;
  onAddCustomer?: (customer?: ICustomer) => void;
};

type CustomerListItem =
  | Pick<ICustomer, 'name' | 'mobile' | '_id'>
  | {
      name: string;
      mobile?: string;
    };

export const AddCustomerModal = (props: Props) => {
  const {onClose, visible, onAddCustomer, customer: customerProp} = props;

  const realm = useRealm() as Realm;
  const customers = getCustomers({realm});
  const contactService = getContactService();
  const getPhoneContactsPromiseFn = () => contactService.getPhoneContacts();

  const {callingCode} = useIPGeolocation();
  const {run: runGetPhoneContacts} = useAsync(getPhoneContactsPromiseFn, {
    defer: true,
  });
  const [mobile, setMobile] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [saveToPhoneBook, setSaveToPhoneBook] = useState(true);
  const [countryCode, setCountryCode] = useState(callingCode || '');
  const [allCustomers, setAllCustomers] = useState<CustomerListItem[]>([]);
  const [customer, setCustomer] = useState<ICustomer | undefined>(
    customerProp || ({} as ICustomer),
  );
  const [customerSearchQuery, setCustomerSearchQuery] = useState(
    customerProp?.name ?? '',
  );

  const handleClose = useCallback(() => {
    setIsNewCustomer(false);
    onClose();
  }, [onClose]);

  const handleChangeSearchQuery = useCallback((searchValue) => {
    setCustomerSearchQuery(searchValue);
  }, []);

  const handleSaveToPhoneBookChange = useCallback((checked: boolean) => {
    setSaveToPhoneBook(checked);
  }, []);

  const handleCustomerSearch = useCallback((item: ICustomer, text: string) => {
    return (
      `${item.name}`.toLowerCase().indexOf(text.toLowerCase()) > -1 ||
      `${item.mobile}`.toLowerCase().indexOf(text.toLowerCase()) > -1
    );
  }, []);

  const handleSelectCustomer = useCallback((item: ICustomer) => {
    setCustomerSearchQuery(item.name);
    setCustomer(item);
  }, []);

  const handleChangeMobile = (value: PhoneNumber) => {
    setMobile(value.number);
    setCountryCode(value.callingCode);
    if (isNewCustomer) {
      setCustomer({
        name: customerSearchQuery,
        mobile: `+${value.callingCode}${value.number}`,
      });
    }
  };

  const handleSave = useCallback(async () => {
    if (isNewCustomer && saveToPhoneBook) {
      try {
        await contactService.addContact({
          givenName: customer?.name ?? '',
          phoneNumbers: [
            {
              label: 'mobile',
              number: customer?.mobile ?? '',
            },
          ],
        });
      } catch (error) {
        Alert.alert('Error', error);
      }
    }
    onAddCustomer && onAddCustomer(customer);
    handleClose();
    showToast({message: 'CUSTOMER ADDED'});
  }, [
    contactService,
    customer,
    handleClose,
    isNewCustomer,
    onAddCustomer,
    saveToPhoneBook,
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
      setAllCustomers([
        ...customers,
        ...contacts.reduce<CustomerListItem[]>(
          (acc, {givenName, familyName, phoneNumber}) => {
            const existing = customers.filtered(
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
    <BottomHalfModalContainer visible={visible} onClose={handleClose}>
      <View
        style={applyStyles({
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: colors.white,
        })}>
        <View style={applyStyles('px-16')}>
          <Text
            style={applyStyles(
              'pb-32 text-base text-gray-200 text-center text-uppercase text-700',
            )}>
            Add Customer
          </Text>
          <AutoComplete<ICustomer>
            rightIcon="users"
            items={allCustomers}
            value={customerSearchQuery}
            setFilter={handleCustomerSearch}
            onItemSelect={handleSelectCustomer}
            renderItem={renderSearchDropdownItem}
            onChangeText={handleChangeSearchQuery}
            label="Select or add customer (optional)"
            inputStyle={applyStyles('mb-16 bg-gray-10')}
            noResultsAction={() => setIsNewCustomer(true)}
            textInputProps={{placeholder: 'Search or add a customer '}}
          />
          {isNewCustomer && (
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
        </View>
        <View
          style={applyStyles(
            'flex-row items-center py-12 px-16 bg-white justify-between',
            {
              borderTopWidth: 1,
              borderTopColor: colors['gray-20'],
            },
          )}>
          <Button
            title="Cancel"
            variantColor="clear"
            onPress={handleClose}
            style={applyStyles({
              width: '48%',
            })}
          />
          <Button
            title="Done"
            variantColor="red"
            onPress={handleSave}
            style={applyStyles({
              width: '48%',
            })}
          />
        </View>
      </View>
    </BottomHalfModalContainer>
  );
};
