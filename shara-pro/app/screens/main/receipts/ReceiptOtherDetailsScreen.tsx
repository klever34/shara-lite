import {
  Accordiontem,
  AppInput,
  AutoComplete,
  Button,
  CurrencyInput,
  DatePicker,
  PhoneNumber,
  PhoneNumberField,
  RadioButton,
  toNumber,
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
import {useReceipt} from '@/services/receipt';
import {applyStyles, colors} from '@/styles';
import {addDays, format} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {SafeAreaView, Text, TextInput, View} from 'react-native';
import {useReceiptProvider} from './ReceiptProvider';

type CustomerListItem =
  | Pick<ICustomer, 'name' | 'mobile' | '_id'>
  | {
      name: string;
      mobile?: string;
    };

export const ReceiptOtherDetailsScreen = () => {
  const realm = useRealm() as Realm;
  const {saveReceipt} = useReceipt();
  const navigation = useAppNavigation();
  const customers = getCustomers({realm});
  const contactService = getContactService();
  const getPhoneContactsPromiseFn = () => contactService.getPhoneContacts();

  const {callingCode} = useIPGeolocation();
  const {receipt, handleUpdateReceipt} = useReceiptProvider();
  const {run: runGetPhoneContacts} = useAsync(getPhoneContactsPromiseFn, {
    defer: true,
  });

  const totalAmount = useMemo(() => {
    if (receipt.receiptItems) {
      return receipt.receiptItems
        .map(({quantity: q, price: p}) => {
          const itemPrice = p ? p : 0;
          const itemQuantity = q ? q : 0;
          return itemPrice * itemQuantity;
        })
        .reduce((acc, curr) => acc + curr, 0);
    }
    return 0;
  }, [receipt]);

  const [note, setNote] = useState('');
  const [mobile, setMobile] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [saveToPhoneBook, setSaveToPhoneBook] = useState(true);
  const [amountOwed, setAmountOwed] = useState<number | undefined>();
  const [amountPaid, setAmountPaid] = useState<number | undefined>();
  const [countryCode, setCountryCode] = useState(callingCode || '');
  const [customerSearchQuery, setCustomerSearchQuery] = useState(
    receipt?.customer?.name ?? '',
  );
  const [allCustomers, setAllCustomers] = useState<CustomerListItem[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    receipt?.dueDate || addDays(new Date(), 7),
  );
  const [customer, setCustomer] = useState<ICustomer | undefined>(
    receipt?.customer,
  );

  const handleClearState = useCallback(() => {
    setNote('');
    setMobile('');
    setCustomer({} as ICustomer);
    setCustomerSearchQuery('');
  }, []);

  const handleGoBack = useCallback(() => {
    handleClearState();
    navigation.goBack();
  }, [navigation, handleClearState]);

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

  const handleChangeSearchQuery = useCallback((searchValue) => {
    setCustomerSearchQuery(searchValue);
  }, []);

  const handleAmountPaidChange = useCallback(
    (text) => {
      const paid = toNumber(text);
      setAmountPaid(paid);
      setAmountOwed(totalAmount - paid);
    },
    [totalAmount],
  );

  const handleAmountOwedChange = useCallback(
    (text) => {
      const owed = toNumber(text);
      setAmountOwed(owed);
      setAmountPaid(totalAmount - owed);
    },
    [totalAmount],
  );

  const handleNoteChange = useCallback((text: string) => {
    setNote(text);
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
        mobile: `+${value.callingCode}${value.number}`,
      });
    }
  };

  const handleFinish = useCallback(async () => {
    const paid = amountOwed ? amountPaid : totalAmount;

    const receiptToCreate: any = {
      ...receipt,
      note,
      realm,
      dueDate,
      totalAmount,
      amountPaid: paid,
      creditAmount: amountOwed,
      payments: [{method: '', amount: paid}],
      customer: customer ? customer : ({} as ICustomer),
    };

    if (isNewCustomer) {
      if (saveToPhoneBook && customer?.mobile) {
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
          console.log(error.message);
        }
      } else {
        receiptToCreate.customer = {name: customerSearchQuery};
      }
    }
    handleUpdateReceipt(receiptToCreate);
    const createdReceipt = await saveReceipt(receiptToCreate);
    handleClearState();
    navigation.navigate('ReceiptSuccess', {id: createdReceipt._id});
  }, [
    amountOwed,
    amountPaid,
    totalAmount,
    receipt,
    customerSearchQuery,
    note,
    realm,
    dueDate,
    customer,
    isNewCustomer,
    saveToPhoneBook,
    handleUpdateReceipt,
    saveReceipt,
    handleClearState,
    navigation,
    contactService,
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
  const amountPaidFieldRef = useRef<TextInput | null>(null);
  const amountOwedFieldRef = useRef<TextInput | null>(null);
  const customerFieldRef = useRef<TextInput | null>(null);
  const noteFieldRef = useRef<TextInput | null>(null);

  return (
    <SafeAreaView style={applyStyles('flex-1 bg-white')}>
      <Page
        header={{
          title: `Total: ${amountWithCurrency(totalAmount)}`,
          iconLeft: {iconName: 'arrow-left', onPress: handleGoBack},
          titleStyle: applyStyles({fontSize: 14}, 'text-gray-300'),
        }}>
        <View>
          <AutoComplete
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
            ref={customerFieldRef}
            textInputProps={{
              placeholder: 'Search or add a customer',
              returnKeyType: 'next',
              onSubmitEditing: () => {
                setImmediate(() => {
                  if (noteFieldRef.current) {
                    noteFieldRef.current.focus();
                  }
                });
              },
            }}
          />
          {isNewCustomer && (
            <>
              <PhoneNumberField
                label="phone number?"
                placeholder="Enter phone number"
                containerStyle={applyStyles('mb-24')}
                onChangeText={(data) => handleChangeMobile(data)}
                value={{number: mobile, callingCode: countryCode}}
                onSubmitEditing={() => {
                  setImmediate(() => {
                    if (noteFieldRef.current) {
                      noteFieldRef.current.focus();
                    }
                  });
                }}
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
            ref={noteFieldRef}
            label="Notes (optional)"
            textAlignVertical="top"
            onChangeText={handleNoteChange}
            style={applyStyles('mb-16', {height: 96})}
            onSubmitEditing={() => {
              setImmediate(() => {
                if (amountPaidFieldRef.current) {
                  amountPaidFieldRef.current.focus();
                }
              });
            }}
            placeholder="Any other information about this transaction?"
          />
          <Accordiontem
            title="Is the customer owing?"
            titleContainerStyle={applyStyles('mb-16 bg-gray-50')}>
            <View
              style={applyStyles(
                'pb-24 flex-row items-center justify-between',
              )}>
              <View style={applyStyles({width: '48%'})}>
                <CurrencyInput
                  placeholder="0.00"
                  label="Customer Paid"
                  returnKeyType="next"
                  value={amountPaid}
                  onChangeText={handleAmountPaidChange}
                  onSubmitEditing={() => {
                    setImmediate(() => {
                      if (amountOwedFieldRef.current) {
                        amountOwedFieldRef.current.focus();
                      }
                    });
                  }}
                />
              </View>
              <View style={applyStyles({width: '48%'})}>
                <CurrencyInput
                  ref={amountOwedFieldRef}
                  placeholder="0.00"
                  label="Customer owes"
                  returnKeyType="next"
                  value={amountOwed}
                  onChangeText={handleAmountOwedChange}
                />
              </View>
            </View>
            {dueDate && (
              <DatePicker
                value={dueDate}
                minimumDate={new Date()}
                onChange={(e: Event, date?: Date) => handleDueDateChange(date)}>
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
          </Accordiontem>
          <Button
            title="Finish"
            variantColor="red"
            onPress={handleFinish}
            style={applyStyles('w-full')}
          />
        </View>
      </Page>
    </SafeAreaView>
  );
};
