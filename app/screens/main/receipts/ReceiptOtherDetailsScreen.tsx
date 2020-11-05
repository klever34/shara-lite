import {
  AppInput,
  AutoComplete,
  Button,
  CurrencyInput,
  DatePicker,
  PhoneNumberField,
  RadioButton,
  PhoneNumber,
} from '@/components';
import {Icon} from '@/components/Icon';
import {Page} from '@/components/Page';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {getContactService} from '@/services';
import {useAsync} from '@/services/api';
import {getCustomers} from '@/services/customer';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {saveReceipt} from '@/services/ReceiptService';
import {applyStyles, colors} from '@/styles';
import {addDays, format} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {SafeAreaView, Text, View} from 'react-native';
import {useReceiptProvider} from './ReceiptProvider';

type CustomerListItem =
  | Pick<ICustomer, 'name' | 'mobile' | '_id'>
  | {
      name: string;
      mobile?: string;
    };

export const ReceiptOtherDetailsScreen = () => {
  const realm = useRealm() as Realm;
  const navigation = useAppNavigation();
  const customers = getCustomers({realm});
  const contactService = getContactService();
  const getPhoneContactsPromiseFn = () => contactService.getPhoneContacts();

  const {callingCode} = useIPGeolocation();
  const {receipt, handleUpdateReceipt} = useReceiptProvider();
  const {run: runGetPhoneContacts} = useAsync(getPhoneContactsPromiseFn, {
    defer: true,
  });

  const [note, setNote] = useState('');
  const [mobile, setMobile] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [saveToPhoneBook, setSaveToPhoneBook] = useState(true);
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [countryCode, setCountryCode] = useState(callingCode || '');
  const [amountPaid, setAmountPaid] = useState(receipt.totalAmount || 0);
  const [customerSearchQuery, setCustomerSearchQuery] = useState(
    receipt?.customer?.name ?? '',
  );
  const [allCustomers, setAllCustomers] = useState<CustomerListItem[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    receipt?.dueDate || addDays(new Date(), 7),
  );
  const [customer, setCustomer] = useState<ICustomer | undefined>(
    receipt?.customer || ({} as ICustomer),
  );

  const creditAmount = useMemo(() => receipt.totalAmount - amountPaid, [
    amountPaid,
    receipt.totalAmount,
  ]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCustomerSearch = useCallback((item: ICustomer, text: string) => {
    return `${item.name}`.toLowerCase().indexOf(text.toLowerCase()) > -1;
  }, []);

  const handleSelectCustomer = useCallback((item: ICustomer) => {
    setCustomerSearchQuery(item.name);
    setCustomer(item);
  }, []);

  const handleChangeSearchQuery = useCallback((searchValue) => {
    setCustomerSearchQuery(searchValue);
  }, []);

  const handleAmountPaidChange = useCallback((text) => {
    setAmountPaid(text);
  }, []);

  const handleNoteChange = useCallback((text: string) => {
    setNote(text);
  }, []);

  const handleIsPartialPaymentChange = useCallback((checked: boolean) => {
    setIsPartialPayment(checked);
  }, []);

  const handleSaveToPhoneBookChange = useCallback((checked: boolean) => {
    setSaveToPhoneBook(checked);
  }, []);

  const handleDueDateChange = useCallback((date?: Date) => {
    if (date) {
      setDueDate(date);
    }
  }, []);

  const handleChangeMobile = (value: PhoneNumber) => {
    setMobile(value.number);
    setCountryCode(value.callingCode);
    if (isNewCustomer) {
      setCustomer({
        name: customerSearchQuery,
        mobile: `${value.callingCode}${value.number}`,
      });
    }
  };

  const handleFinish = useCallback(async () => {
    let receiptToCreate: any = {
      ...receipt,
      note,
      realm,
      dueDate,
      customer,
      amountPaid,
      creditAmount,
      payments: [{method: '', amount: amountPaid}],
    };
    if (customerSearchQuery && saveToPhoneBook) {
      try {
        await contactService.addContact(customer);
      } catch (error) {
        console.log(error);
      }
    }
    handleUpdateReceipt(receiptToCreate);
    const createdReceipt = saveReceipt(receiptToCreate);
    navigation.navigate('ReceiptSuccess', {id: createdReceipt._id});
  }, [
    note,
    realm,
    receipt,
    dueDate,
    customer,
    amountPaid,
    navigation,
    creditAmount,
    contactService,
    saveToPhoneBook,
    customerSearchQuery,
    handleUpdateReceipt,
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
    <SafeAreaView style={applyStyles('flex-1 bg-white')}>
      <Page
        header={{
          title: `Total: ${amountWithCurrency(receipt.totalAmount)}`,
          iconLeft: {iconName: 'arrow-left', onPress: handleGoBack},
        }}
        footer={
          <Button
            title="Finish"
            variantColor="red"
            onPress={handleFinish}
            style={applyStyles('w-full')}
          />
        }>
        <View style={applyStyles('pt-24')}>
          <RadioButton
            isChecked={isPartialPayment}
            containerStyle={applyStyles('py-16 mb-24 center')}
            onChange={handleIsPartialPaymentChange}>
            <Text style={applyStyles('text-400 text-gray-300')}>
              Credit Payment?
            </Text>
          </RadioButton>
          {isPartialPayment && (
            <>
              <View
                style={applyStyles(
                  'pb-24 flex-row items-center justify-between',
                )}>
                <View style={applyStyles({width: '48%'})}>
                  <CurrencyInput
                    placeholder="0.00"
                    label="Customer Paid"
                    value={amountPaid?.toString()}
                    onChange={(text) => handleAmountPaidChange(text)}
                  />
                </View>
                <View style={applyStyles({width: '48%'})}>
                  <CurrencyInput
                    editable={false}
                    placeholder="0.00"
                    label="Customer owes"
                    value={(receipt.totalAmount - amountPaid)?.toString()}
                  />
                </View>
              </View>
              {dueDate && (
                <DatePicker
                  value={dueDate}
                  minimumDate={new Date()}
                  onChange={(e: Event, date?: Date) =>
                    handleDueDateChange(date)
                  }>
                  {(toggleShow) => (
                    <Touchable onPress={toggleShow}>
                      <View style={applyStyles('pb-16')}>
                        <Text
                          style={applyStyles(
                            'text-xs text-uppercase text-500 text-gray-100 pb-8',
                          )}>
                          Payment due date (optional)
                        </Text>
                        <View style={applyStyles('flex-row items-center')}>
                          <View
                            style={applyStyles(
                              'w-full items-center flex-row px-16 text-500 pr-56 bg-gray-10',
                              {
                                height: 56,
                                borderRadius: 8,
                              },
                            )}>
                            {dueDate ? (
                              <Text style={applyStyles('text-500 text-base')}>
                                {format(dueDate, 'dd/MM/yyyy')}
                              </Text>
                            ) : (
                              <Text
                                style={applyStyles(
                                  'text-500 text-gray-300 text-base',
                                )}>
                                Select date for balance to be paid
                              </Text>
                            )}
                          </View>
                          <View
                            style={applyStyles('flex-row center', {
                              position: 'absolute',
                              right: 12,
                              top: 16,
                              zIndex: 10,
                            })}>
                            <Icon
                              size={24}
                              name="calendar"
                              type="feathericons"
                              color={colors['gray-50']}
                            />
                          </View>
                        </View>
                      </View>
                    </Touchable>
                  )}
                </DatePicker>
              )}
            </>
          )}
          <AutoComplete<CustomerListItem>
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
          <AppInput
            multiline
            value={note}
            label="Notes (optional)"
            onChangeText={handleNoteChange}
            style={applyStyles('pt-0 mb-96', {height: 96})}
            placeholder="Any other information about this transaction?"
          />
        </View>
      </Page>
    </SafeAreaView>
  );
};
