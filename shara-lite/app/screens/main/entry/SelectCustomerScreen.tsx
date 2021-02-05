import {Button, SearchFilter} from '@/components';
import {CustomerForm} from '@/components/CustomerForm';
import {HeaderBackButton} from '@/components/HeaderBackButton';
import {Icon} from '@/components/Icon';
import PlaceholderImage from '@/components/PlaceholderImage';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {ICustomer} from '@/models';
import {MainStackParamList} from '@/screens/main';
import {getContactService} from '@/services';
import {useCustomer} from '@/services/customer/hook';
import {handleError} from '@/services/error-boundary';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  FlatList,
  Keyboard,
  ListRenderItemInfo,
  SafeAreaView,
  View,
} from 'react-native';
import {Text} from '@/components';
import {useCustomerList} from '../customers/CustomerListScreen';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

export type SelectCustomerListItem = Partial<ICustomer>;

export type SelectCustomerListScreenParams = {
  withCustomer?: boolean;
  isCollection?: boolean;
  transaction?: {
    note?: string;
    amount_paid?: number;
    total_amount?: number;
    credit_amount?: number;
    transaction_date?: Date;
  };
  onSelectCustomer: (customer?: SelectCustomerListItem) => void;
};

export type SelectCustomerListScreenProps = {
  route: RouteProp<MainStackParamList, 'SelectCustomerList'>;
} & ModalWrapperFields;

export const SelectCustomerListScreen = withModal(
  ({route, openModal}: SelectCustomerListScreenProps) => {
    const {withCustomer, onSelectCustomer, isCollection} = route.params;

    const {
      searchTerm,
      filteredCustomers,
      handleCustomerSearch,
    } = useCustomerList({
      orderByOptions: {orderByQuery: ['name'], orderByOrder: ['asc', 'desc']},
    });

    const {saveCustomer} = useCustomer();
    const {callingCode} = useIPGeolocation();

    const [customer, setCustomer] = useState<
      SelectCustomerListItem | undefined
    >();
    const [isSavingCustomer, setIsSavingCustomer] = useState(false);

    const handleSetCustomer = useCallback(
      (selectedCustomer: SelectCustomerListItem) => {
        setCustomer(selectedCustomer);
        Keyboard.dismiss();
        handleCustomerSearch('');
      },
      [handleCustomerSearch],
    );

    const handleAddNewCustomer = useCallback(
      async (customerData, callback) => {
        try {
          setIsSavingCustomer(true);
          const newCustomer = await saveCustomer({
            customer: customerData,
            source: 'manual',
          });
          setIsSavingCustomer(false);
          callback();
          handleSetCustomer(newCustomer);
        } catch (error) {
          setIsSavingCustomer(false);
          handleError(error);
        }
      },
      [handleSetCustomer, saveCustomer],
    );

    const handleAddCustomerFromPhonebook = useCallback(async () => {
      try {
        const selection = await getContactService().selectContactPhone();
        if (!selection) {
          return;
        }
        const {contact, selectedPhone} = selection;
        const createCustomerPayload = {
          name: contact.name,
          mobile: selectedPhone.number,
        };
        const newCustomer = await saveCustomer({
          customer: createCustomerPayload,
          source: 'phonebook',
        });
        handleSetCustomer(newCustomer);
      } catch (error) {
        handleError(error);
      }
    }, [saveCustomer, handleSetCustomer]);

    const handleOpenAddCustomerModal = useCallback(() => {
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <View style={applyStyles('p-16')}>
            <Text
              style={applyStyles(
                'pb-16 text-base text-gray-300 text-center text-uppercase text-700',
              )}>
              {strings('customers.add_new_customer_text')}
            </Text>
            <CustomerForm
              onCancel={closeModal}
              isLoading={isSavingCustomer}
              onSubmit={handleAddNewCustomer}
              initialValues={{name: searchTerm, countryCode: callingCode}}
            />
          </View>
        ),
      });
    }, [
      openModal,
      searchTerm,
      callingCode,
      isSavingCustomer,
      handleAddNewCustomer,
    ]);

    const handleSearch = useCallback(
      (text) => {
        handleCustomerSearch(text);
        setCustomer(undefined);
      },
      [handleCustomerSearch],
    );

    const handleClearSearch = useCallback(() => {
      handleCustomerSearch('');
      //@ts-ignore
      handleSetCustomer(undefined);
    }, [handleCustomerSearch, handleSetCustomer]);

    const keyExtractor = useCallback((item, index) => {
      if (!item) {
        return '';
      }
      return `${item._id}-${index}`;
    }, []);

    const renderCustomerListItem = useCallback(
      ({
        item,
        onPress,
      }: Pick<ListRenderItemInfo<SelectCustomerListItem | null>, 'item'> & {
        onPress?: () => void;
      }) => {
        return (
          <Touchable
            onPress={() => {
              onPress?.();
              item && handleSetCustomer(item);
            }}>
            <View
              style={applyStyles('flex-row items-center px-16 py-12', {
                borderBottomWidth: 1,
                borderBottomColor: colors['gray-20'],
              })}>
              <PlaceholderImage
                text={item?.name ?? ''}
                image={item?.image ? {uri: item?.image} : undefined}
              />
              <View style={applyStyles('flex-1 ml-8')}>
                <Text
                  style={applyStyles(
                    'text-sm text-700 text-gray-300 uppercase',
                  )}>
                  {item?.name}
                </Text>
              </View>
              <View>
                <Text style={applyStyles('text-sm text-400 text-gray-300')}>
                  {item?.mobile}
                </Text>
              </View>
            </View>
          </Touchable>
        );
      },
      [handleSetCustomer],
    );

    return (
      <SafeAreaView style={applyStyles('flex-1 bg-white')}>
        <View
          style={applyStyles('flex-row py-8 bg-white items-center', {
            borderBottomWidth: 1.5,
            borderBottomColor: colors['gray-20'],
          })}>
          <HeaderBackButton />
          <View style={applyStyles('pl-4')}>
            <Text style={applyStyles('pb-4 text-700 text-base text-gray-300')}>
              {strings('customers.select_customer.title')}
            </Text>
            <Text style={applyStyles('text-400 text-gray-200')}>
              {strings('customers.select_customer.description')}
            </Text>
          </View>
        </View>
        <View style={applyStyles('px-16 py-12')}>
          <SearchFilter
            value={searchTerm}
            onSearch={handleSearch}
            onClearInput={handleClearSearch}
            inputStyle={applyStyles('bg-gray-10', {borderRadius: 8})}
            placeholderText={strings('customers.search_input_placeholder')}
          />
        </View>

        {!!searchTerm && (
          <Touchable onPress={handleOpenAddCustomerModal}>
            <View
              style={applyStyles(
                'px-16 py-8 flex-row items-center justify-between',
                {
                  borderTopWidth: 1.5,
                  borderTopColor: colors['gray-20'],
                },
              )}>
              <View style={applyStyles('flex-row items-center')}>
                <View
                  style={applyStyles(
                    'w-36 h-36 rounded-36 center bg-green-50',
                  )}>
                  <Icon
                    size={18}
                    name="plus"
                    type="feathericons"
                    color={colors['green-200']}
                  />
                </View>
                <Text
                  style={applyStyles('pl-8 text-base text-400 text-gray-50')}>
                  {strings('customers.add_as_new_customer', {
                    customer_name: searchTerm,
                  })}
                </Text>
              </View>
              <View>
                <Icon
                  size={24}
                  name="plus"
                  type="feathericons"
                  color={colors['green-100']}
                />
              </View>
            </View>
          </Touchable>
        )}
        <Touchable onPress={handleAddCustomerFromPhonebook}>
          <View
            style={applyStyles(
              'px-16 py-8 flex-row items-center justify-between',
              {
                borderTopWidth: 1.5,
                borderTopColor: colors['gray-20'],
              },
            )}>
            <View style={applyStyles('flex-row items-center')}>
              <View
                style={applyStyles('w-36 h-36 rounded-24 center bg-green-50')}>
                <Icon
                  size={18}
                  name="users"
                  type="feathericons"
                  color={colors['green-200']}
                />
              </View>
              <Text style={applyStyles('pl-8 text-base')}>
                {strings('select_from_phonebook')}
              </Text>
            </View>
            <View>
              <Icon
                size={24}
                name="chevron-right"
                type="feathericons"
                color={colors['green-100']}
              />
            </View>
          </View>
        </Touchable>

        {customer && (
          <View
            style={applyStyles(
              'flex-row items-center border-b-1 border-gray-20 px-16 py-12 bg-green-200',
            )}>
            <PlaceholderImage
              text={customer?.name ?? ''}
              style={applyStyles('bg-white')}
              textStyle={applyStyles('text-green-200')}
              image={customer.image ? {uri: customer?.image} : undefined}
            />
            <View style={applyStyles('flex-1 ml-8')}>
              <Text
                style={applyStyles(
                  'text-sm text-700 text-gray-300 uppercase text-white',
                )}>
                {customer?.name}
              </Text>
            </View>
            <View>
              <Text
                style={applyStyles(
                  'text-sm text-400 text-gray-300 text-white',
                )}>
                {customer?.mobile}
              </Text>
            </View>
          </View>
        )}
        <View
          style={applyStyles('px-16 py-12 flex-row bg-gray-10', {
            borderTopWidth: 1.5,
            borderBottomWidth: 1.5,
            borderTopColor: colors['gray-20'],
            borderBottomColor: colors['gray-20'],
          })}>
          <Text style={applyStyles('text-base text-gray-300')}>
            {strings('customer', {count: 2})}
          </Text>
        </View>
        <FlatList
          data={filteredCustomers}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps="always"
          renderItem={renderCustomerListItem}
          ListEmptyComponent={
            <View style={applyStyles('center py-48')}>
              <Icon
                size={24}
                name="users"
                type="feathericons"
                color={colors['gray-50']}
                style={applyStyles('mb-12')}
              />
              <Text style={applyStyles('text-center text-400 text-gray-50')}>
                {strings('customers.customer_count', {count: 0})}
              </Text>
            </View>
          }
        />
        {!withCustomer
          ? customer && (
              <View
                style={applyStyles(
                  'px-16 py-8 bg-white flex-row items-center justify-between',
                )}>
                <Button
                  title="Cancel"
                  variantColor="transparent"
                  onPress={() => onSelectCustomer()}
                  style={applyStyles({width: '48%'})}
                />
                <Button
                  title="Save"
                  style={applyStyles({width: '48%'})}
                  onPress={() => onSelectCustomer(customer)}
                />
              </View>
            )
          : customer && (
              <View
                style={applyStyles(
                  'px-16 py-8 bg-white flex-row items-center justify-end',
                )}>
                <Button
                  style={applyStyles({width: '48%'})}
                  title={isCollection ? 'Next' : 'Save'}
                  onPress={() => onSelectCustomer(customer)}
                />
              </View>
            )}
      </SafeAreaView>
    );
  },
);
