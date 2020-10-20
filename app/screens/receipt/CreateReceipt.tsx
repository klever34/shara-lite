import {
  Button,
  ContactsListModal,
  CurrencyInput,
  DatePicker,
  PageModal,
  SummaryTableFooter,
  SummaryTableHeader,
  summaryTableHeaderStyles,
  SummaryTableItem,
  SummaryTableItemProps,
  summaryTableStyles,
} from '@/components';
import Icon from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import {IReceiptItem} from '@/models/ReceiptItem';
import {getAnalyticsService, getAuthService} from '@/services';
import {getCustomers} from '@/services/customer';
import {useErrorHandler} from '@/services/error-boundary';
import {useRealm} from '@/services/realm';
import {saveReceipt} from '@/services/ReceiptService';
import {colors} from '@/styles';
import {addDays} from 'date-fns';
import {format} from 'date-fns/esm';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import {AddCustomer} from '../main/customers';
import {ReceiptItemModalContent} from './ReceiptItemModal';
import {ReceiptPreviewModal} from './ReceiptPreviewModal';

type Props = {
  receipt?: IReceipt;
  closeReceiptModal: () => void;
  initialCustomer?: ICustomer;
  onSnapReceipt?(callback: (imageUri: string) => void): void;
} & ModalWrapperFields;

export const CreateReceipt = withModal((props: Props) => {
  const {
    receipt,
    openModal,
    // onSnapReceipt,
    initialCustomer,
    closeReceiptModal,
  } = props;

  const realm = useRealm();
  const handleError = useErrorHandler();
  const myCustomers = getCustomers({realm});
  const currency = getAuthService().getUserCurrency();

  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [totalAmount, setTotalAmount] = useState(receipt?.total_amount || 0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    receipt?.dueDate || addDays(new Date(), 7),
  );
  const [receiptItems, setReceiptItems] = useState<IReceiptItem[]>(
    receipt?.items || [],
  );
  const [customer, setCustomer] = useState<ICustomer>(
    receipt?.customer || ({} as ICustomer),
  );
  const [
    snappedReceipt,
    // setSnappedReceipt,
  ] = useState('');
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  const tax = 0;
  const creditAmount = totalAmount - amountPaid;

  useEffect(() => {
    getAnalyticsService().logEvent('receiptStart').catch(handleError);
  }, [handleError, receipt]);

  useEffect(() => {
    if (initialCustomer) {
      setCustomer(initialCustomer);
    }
  }, [initialCustomer]);

  const handleNoteChange = useCallback((text: string) => {
    setNote(text);
  }, []);

  const handleAmountPaidChange = useCallback((text) => {
    setAmountPaid(text);
  }, []);

  const handleDueDateChange = useCallback((date?: Date) => {
    if (date) {
      setDueDate(date);
    }
  }, []);

  const handleOpenAddCustomerModal = useCallback(() => {
    setIsAddCustomerModalOpen(true);
  }, []);

  const handleCloseAddCustomerModal = useCallback(() => {
    setIsAddCustomerModalOpen(false);
  }, []);

  const handleAddNewCustomer = useCallback(
    (newCustomer) => {
      setCustomer(newCustomer);
      handleCloseAddCustomerModal();
    },
    [handleCloseAddCustomerModal],
  );

  const handleContactSelect = useCallback((newCustomer, callback) => {
    setCustomer(newCustomer);
    callback();
  }, []);

  const handleUpdateReceiptItem = useCallback(
    (item: IReceiptItem) => {
      setReceiptItems(
        receiptItems.map((receiptItem) => {
          if (
            receiptItem.product._id?.toString() === item.product._id?.toString()
          ) {
            return item;
          }
          return receiptItem;
        }),
      );
    },
    [receiptItems],
  );

  const handleRemoveReceiptItem = useCallback(
    (item: IReceiptItem) => {
      setReceiptItems(
        receiptItems.filter(
          (receiptItem) =>
            receiptItem.product._id?.toString() !==
            item.product._id?.toString(),
        ),
      );
    },
    [receiptItems],
  );

  const handleAddReceiptItem = useCallback(
    (item: IReceiptItem) => {
      if (
        receiptItems
          .map((receiptItem) => receiptItem.product._id?.toString())
          .includes(item?.product._id?.toString())
      ) {
        handleUpdateReceiptItem(item);
      } else {
        getAnalyticsService()
          .logEvent('productAddedToReceipt')
          .catch(handleError);
        setReceiptItems([item, ...receiptItems]);
      }
    },
    [handleError, receiptItems, handleUpdateReceiptItem],
  );

  const handleClearReceipt = useCallback(() => {
    setReceiptItems([]);
  }, []);

  const handleOpenReceiptItemModal = useCallback(() => {
    const closeReceiptItemModal = openModal('full', {
      animationInTiming: 0.1,
      animationOutTiming: 0.1,
      renderContent: () => (
        <ReceiptItemModalContent
          //@ts-ignore
          onDone={handleAddReceiptItem}
          closeModal={closeReceiptItemModal}
        />
      ),
    });
  }, [openModal, handleAddReceiptItem]);

  const handleOpenEditReceiptItemModal = useCallback(
    (item: IReceiptItem) => {
      getAnalyticsService()
        .logEvent('selectContent', {
          item_id: String(item._id),
          content_type: 'ReceiptItem',
        })
        .catch(handleError);
      const closeReceiptItemModal = openModal('full', {
        animationInTiming: 0.1,
        animationOutTiming: 0.1,
        renderContent: () => (
          <ReceiptItemModalContent
            item={item}
            //@ts-ignore
            onDone={handleUpdateReceiptItem}
            closeModal={closeReceiptItemModal}
            onDelete={() => {
              handleRemoveReceiptItem(item);
              closeReceiptItemModal();
            }}
          />
        ),
      });
    },
    [handleError, openModal, handleUpdateReceiptItem, handleRemoveReceiptItem],
  );

  const handleOpenReceiptPreviewModal = useCallback(
    (item: IReceipt) => {
      const closeReceiptPreviewModal = openModal('full', {
        animationInTiming: 0.1,
        animationOutTiming: 0.1,
        renderContent: () => (
          <ReceiptPreviewModal
            receiptId={item._id}
            closeModal={() => {
              closeReceiptPreviewModal(closeReceiptModal);
            }}
          />
        ),
      });
    },
    [openModal, closeReceiptModal],
  );

  const handleOpenContactList = useCallback(() => {
    const closeContactListModal = openModal('bottom-half', {
      swipeDirection: [],
      renderContent: () => (
        <ContactsListModal<ICustomer>
          entity="Customer"
          onClose={closeContactListModal}
          onAddNew={handleOpenAddCustomerModal}
          onContactSelect={(data) =>
            handleContactSelect(data, closeContactListModal)
          }
          createdData={(myCustomers as unknown) as ICustomer[]}
        />
      ),
    });
  }, [handleContactSelect, handleOpenAddCustomerModal, myCustomers, openModal]);

  const handleSnapReceipt = useCallback(() => {
    Alert.alert('Coming Soon', 'This feature is coming in the next update');
    // onSnapReceipt?.((uri) => setSnappedReceipt(uri));
  }, []);

  const handleSaveReceipt = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      let receiptToCreate: any = {
        tax,
        realm,
        dueDate,
        customer,
        amountPaid,
        totalAmount,
        creditAmount,
        receiptItems,
        payments: [{method: '', amount: amountPaid}],
      };

      if (snappedReceipt) {
        receiptToCreate = {...receiptToCreate, local_image_url: snappedReceipt};
      }

      const createdReceipt = saveReceipt(receiptToCreate);
      handleClearReceipt();
      setIsSaving(false);
      ToastAndroid.show('Receipt created', ToastAndroid.SHORT);
      handleOpenReceiptPreviewModal(createdReceipt);
    }, 300);
  }, [
    realm,
    dueDate,
    customer,
    amountPaid,
    totalAmount,
    creditAmount,
    receiptItems,
    snappedReceipt,
    handleClearReceipt,
    handleOpenReceiptPreviewModal,
  ]);

  const renderReceiptItem = useCallback(
    ({item}: SummaryTableItemProps) => (
      <SummaryTableItem
        item={item}
        onPress={() => {
          getAnalyticsService()
            .logEvent('selectContent', {
              item_id: String(item._id),
              content_type: 'ReceiptItem',
            })
            .catch(handleError);
          return handleOpenEditReceiptItemModal(item);
        }}
      />
    ),
    [handleError, handleOpenEditReceiptItemModal],
  );

  useEffect(() => {
    const total = receiptItems
      .map(({quantity, price}) => {
        const itemPrice = price ? price : 0;
        const itemQuantity = quantity ? quantity : 0;
        return itemPrice * itemQuantity;
      })
      .reduce((acc, curr) => acc + curr, 0);

    setTotalAmount(total);
    setAmountPaid(total);
  }, [receiptItems]);

  return (
    <View>
      <FlatList
        data={receiptItems}
        persistentScrollbar
        renderItem={renderReceiptItem}
        keyboardShouldPersistTaps="always"
        keyExtractor={(item) => `${item?.product._id?.toString()}`}
        ListHeaderComponent={
          <>
            <View
              style={applyStyles('pt-lg px-lg flex-row items-center', {
                paddingBottom: 8,
              })}>
              <View style={applyStyles({width: '48%'})}>
                <Text style={applyStyles('text-700 text-uppercase')}>
                  Create a receipt
                </Text>
              </View>
              <View style={applyStyles('items-end', {width: '48%'})}>
                <Touchable onPress={handleSnapReceipt}>
                  <View
                    style={applyStyles('flex-row items-center', {height: 48})}>
                    <Icon
                      size={24}
                      name="camera"
                      type="feathericons"
                      color={colors.primary}
                    />
                    <Text
                      style={applyStyles('pl-sm text-400 text-uppercase', {
                        color: colors.primary,
                      })}>
                      Snap receipt
                    </Text>
                  </View>
                </Touchable>
              </View>
            </View>

            <View style={applyStyles({paddingBottom: 32})}>
              <Touchable
                onPress={initialCustomer ? undefined : handleOpenContactList}>
                <View style={applyStyles('px-lg py-lg flex-row items-center')}>
                  <Text
                    style={applyStyles('text-400', {
                      color: colors['gray-200'],
                    })}>
                    Receipt for:
                  </Text>
                  <Text
                    style={applyStyles(
                      'text-500 pl-sm',
                      initialCustomer
                        ? undefined
                        : {
                            color: colors.primary,
                            textDecorationLine: 'underline',
                            textDecorationColor: colors.primary,
                          },
                    )}>
                    {customer.name ? customer.name : 'Add Customer Details'}
                  </Text>
                </View>
              </Touchable>
              <View style={applyStyles('px-lg pt-sm pb-md')}>
                <Text
                  style={applyStyles('text-400', {
                    color: colors['gray-200'],
                  })}>
                  Date: {format(new Date(), 'dd/MM/yyyy, hh:mm:a')}
                </Text>
              </View>
            </View>
            <SummaryTableHeader />

            <Touchable onPress={handleOpenReceiptItemModal}>
              <View
                style={applyStyles(
                  summaryTableStyles.row,
                  summaryTableHeaderStyles.row,
                  {
                    height: 48,
                    borderTopWidth: 0,
                  },
                )}>
                <View
                  style={applyStyles(
                    summaryTableStyles.column,
                    summaryTableStyles['column-25'],
                  )}>
                  <View
                    style={applyStyles('flex-row items-center h-full w-full')}>
                    <Icon
                      name="plus"
                      type="feathericons"
                      color={colors.primary}
                    />
                    <Text
                      style={applyStyles('text-500', {
                        fontSize: 12,
                        color: colors.primary,
                      })}>
                      Add Item
                    </Text>
                  </View>
                </View>
                <View
                  style={applyStyles(
                    summaryTableStyles.column,
                    summaryTableStyles['column-30'],
                  )}
                />
                <View
                  style={applyStyles(
                    summaryTableStyles['column-15'],
                    summaryTableStyles.column,
                  )}
                />
                <View style={applyStyles(summaryTableStyles['column-30'])} />
              </View>
            </Touchable>
          </>
        }
        ListFooterComponent={
          <>
            <View style={applyStyles('pb-32')}>
              <SummaryTableFooter tax={tax} totalAmount={totalAmount} />
            </View>
            <View style={applyStyles('px-lg', {paddingBottom: 40})}>
              <View style={applyStyles('pb-xl flex-row items-center')}>
                <Text style={applyStyles('text-400')}>Paid:</Text>
                <View style={applyStyles('ml-sm')}>
                  <CurrencyInput
                    value={amountPaid.toString()}
                    inputStyle={applyStyles({
                      height: 48,
                      width: 200,
                      borderWidth: 1,
                      paddingTop: 14,
                      fontFamily: 'Rubik-Regular',
                      borderColor: colors['gray-50'],
                      borderBottomColor: colors['gray-50'],
                      paddingLeft: currency.length > 1 ? 40 : 20,
                    })}
                    iconStyle={applyStyles('px-xs')}
                    placeholder="How much was paid?"
                    onChange={(value) => handleAmountPaidChange(value)}
                  />
                </View>
              </View>
              <View style={applyStyles('flex-row')}>
                <Text style={applyStyles('text-400')}>Note:</Text>
                <View style={applyStyles('ml-sm')}>
                  <TextInput
                    multiline
                    value={note}
                    style={applyStyles('px-lg py-0', {
                      width: '55%',
                      height: 100,
                      borderWidth: 1,
                      fontFamily: 'Rubik-Regular',
                      borderColor: colors['gray-50'],
                    })}
                    onChangeText={handleNoteChange}
                    placeholder="Add extra info here e.g Driver details, vehicle number etc."
                  />
                </View>
              </View>
            </View>
            {!!creditAmount && (
              <View
                style={applyStyles('px-xl', {
                  borderTopWidth: 1,
                  paddingBottom: 40,
                  borderTopColor: colors['gray-20'],
                })}>
                <View style={applyStyles('pt-md pb-xl center')}>
                  <Text
                    style={applyStyles('text-500', {
                      fontSize: 16,
                      color: colors['gray-200'],
                    })}>
                    Credit Details
                  </Text>
                </View>
                <View
                  style={applyStyles(
                    'flex-row items-center, justify-between flex-wrap',
                  )}>
                  <View style={applyStyles('flex-row items-center mb-md')}>
                    <View style={applyStyles('pr-sm')}>
                      <Text style={applyStyles('text-400')}>Balance:</Text>
                    </View>
                    <View>
                      <Text style={applyStyles('text-500')}>
                        {amountWithCurrency(creditAmount)}
                      </Text>
                    </View>
                  </View>
                  {dueDate && (
                    <View style={applyStyles(' mb-md')}>
                      <DatePicker
                        value={dueDate}
                        minimumDate={new Date()}
                        onChange={(e: Event, date?: Date) =>
                          handleDueDateChange(date)
                        }>
                        {(toggleShow) => (
                          <Touchable onPress={toggleShow}>
                            <View style={applyStyles('flex-row items-center')}>
                              <View style={applyStyles('pr-sm')}>
                                <Text style={applyStyles('text-400')}>
                                  Collect on:
                                </Text>
                              </View>
                              <View
                                style={applyStyles('p-sm', {
                                  borderWidth: 1,
                                  borderColor: colors['gray-900'],
                                })}>
                                <Text style={applyStyles('text-500')}>
                                  {format(dueDate, 'dd/MM/yyyy')}
                                </Text>
                              </View>
                            </View>
                          </Touchable>
                        )}
                      </DatePicker>
                    </View>
                  )}
                </View>
              </View>
            )}
            <View style={applyStyles('px-xl', {paddingBottom: 100})}>
              <Button
                title="create"
                variantColor="red"
                isLoading={isSaving}
                onPress={handleSaveReceipt}
                disabled={!receiptItems.length}
              />
            </View>
          </>
        }
      />

      <PageModal
        title="Create Customer"
        visible={isAddCustomerModalOpen}
        onClose={handleCloseAddCustomerModal}>
        <AddCustomer onSubmit={handleAddNewCustomer} />
      </PageModal>
    </View>
  );
});
