import {IReceipt} from '../../../../models/Receipt';
import React, {useCallback, useState} from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Button, ContactsListModal} from '../../../../components';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {applyStyles, amountWithCurrency} from '../../../../helpers/utils';
import {ICustomer} from '../../../../models';
import {IReceiptItem} from '../../../../models/ReceiptItem';
import {colors} from '../../../../styles';
import {CustomerDetailsModal} from './CustomerDetailsModal';
import {CustomersList} from './CustomersList';
import {
  SummaryTableHeader,
  summaryTableItemStyles,
  summaryTableStyles,
} from './ReceiptSummary';
import {
  updateReceipt,
  getAllPayments,
} from '../../../../services/ReceiptService';
import {useRealm} from '../../../../services/realm';
import {Customer} from '../../../../../types/app';
import {PAYMENT_METHOD_LABEL} from '../../../../helpers/constants';
import {getCustomers, saveCustomer} from '../../../../services/CustomerService';

type Props = {
  visible: boolean;
  onClose: () => void;
  receipt: IReceipt | null;
  onPrintReceipt: () => void;
  onOpenShareModal: () => void;
};

type ProductItemProps = {
  item: IReceiptItem;
};

export function ReceiptDetailsModal(props: Props) {
  const {receipt, visible, onClose, onPrintReceipt, onOpenShareModal} = props;
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | ICustomer | undefined>(
    receipt ? receipt.customer : ({} as Customer),
  );
  const [isCustomerListModalOpen, setIsCustomerListModalOpen] = useState(false);
  const realm = useRealm();
  const creditAmountLeft = receipt?.credits?.reduce(
    (acc, item) => acc + item.amount_left,
    0,
  );
  const customers = getCustomers({realm});
  const allPayments = receipt ? getAllPayments({receipt}) : [];

  const handleOpenCustomerModal = useCallback(() => {
    setIsCustomerModalOpen(true);
  }, []);

  const handleCloseCustomerModal = useCallback(() => {
    setIsCustomerModalOpen(false);
  }, []);

  const handleOpenCustomerListModal = useCallback(() => {
    setIsCustomerListModalOpen(true);
  }, []);

  const handleCloseCustomerListModal = useCallback(() => {
    setIsCustomerListModalOpen(false);
  }, []);

  const handleOpenContactListModal = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setIsContactListModalOpen(false);
    handleCloseCustomerListModal();
  }, [handleCloseCustomerListModal]);

  const handleSetCustomer = useCallback((value: ICustomer) => {
    setCustomer(value);
  }, []);

  const handleSaveCustomer = useCallback(
    (value: ICustomer) => {
      setCustomer(value);
      const newCustomer = value.id
        ? value
        : saveCustomer({realm, customer: value});

      receipt && updateReceipt({realm, customer: newCustomer, receipt});
    },
    [realm, receipt],
  );

  const handleCustomerSelect = useCallback(({customer: customerData}) => {
    setCustomer(customerData);
  }, []);

  const renderProductItem = useCallback(
    ({item}: ProductItemProps) => (
      <View
        style={applyStyles(summaryTableStyles.row, summaryTableItemStyles.row)}>
        <View style={summaryTableStyles['column-40']}>
          <Text style={summaryTableItemStyles.text}>
            {item.name} {item.weight ? `(${item.weight})` : ''}
          </Text>
          <Text style={summaryTableItemStyles.subText}>
            {amountWithCurrency(item.price)} Per Unit
          </Text>
        </View>
        <View
          style={applyStyles(summaryTableStyles['column-20'], {
            alignItems: 'flex-end',
          })}>
          <Text style={summaryTableItemStyles.text}>{item.quantity}</Text>
        </View>
        <View
          style={applyStyles(summaryTableStyles['column-40'], {
            alignItems: 'flex-end',
          })}>
          <Text style={summaryTableItemStyles.text}>
            {amountWithCurrency(item.price * item.quantity)}
          </Text>
        </View>
      </View>
    ),
    [],
  );

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView style={applyStyles('px-lg py-xl')}>
        <View
          style={applyStyles(
            'pb-md mb-lg w-full flex-row justify-space-between',
            {
              borderBottomWidth: 1,
              borderBottomColor: colors['gray-20'],
            },
          )}>
          <View style={applyStyles({width: '48%'})}>
            <Text
              style={applyStyles('pb-sm', 'text-400', {
                color: colors['gray-200'],
              })}>
              Receipt for
            </Text>
            <View>
              {receipt?.customer?.mobile ? (
                <Text
                  style={applyStyles('text-400', {
                    fontSize: 18,
                    color: colors['gray-300'],
                  })}>
                  {receipt.customer.name}
                </Text>
              ) : (
                <Text
                  style={applyStyles('text-400', {
                    fontSize: 12,
                    color: colors['gray-50'],
                  })}>
                  - No customer details
                </Text>
              )}
            </View>
          </View>
          <View style={applyStyles({width: '48%', alignItems: 'flex-end'})}>
            <Text
              style={applyStyles('pb-xs', 'text-400', {
                color: colors['gray-200'],
              })}>
              Total
            </Text>
            <Text
              style={applyStyles('text-400', {
                fontSize: 18,
                color: colors.primary,
              })}>
              {amountWithCurrency(receipt?.total_amount)}
            </Text>
          </View>
        </View>
        {!receipt?.customer?.name && (
          <View>
            <Touchable onPress={handleOpenCustomerModal}>
              <View
                style={applyStyles(
                  'py-lg mb-xl flex-row items-center justify-center',
                )}>
                <Icon
                  size={24}
                  name="plus"
                  type="feathericons"
                  color={colors.primary}
                />
                <Text
                  style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                    color: colors.primary,
                  })}>
                  Add customer
                </Text>
              </View>
            </Touchable>
          </View>
        )}
        <View>
          <Text
            style={applyStyles('pb-sm', 'text-400', {
              fontSize: 18,
              color: colors.primary,
            })}>
            Products
          </Text>
          {receipt && (
            <>
              <FlatList
                data={receipt.items}
                renderItem={renderProductItem}
                ListHeaderComponent={SummaryTableHeader}
                keyExtractor={(item, index) =>
                  item ? `${item.id}-${index.toString()}` : index.toString()
                }
              />
              <View style={styles.totalSectionContainer}>
                <View style={styles.totalSection}>
                  <View
                    style={applyStyles(
                      'pb-sm',
                      'flex-row',
                      'items-center',
                      'justify-space-between',
                    )}>
                    <Text
                      style={applyStyles(
                        {
                          color: colors['gray-300'],
                        },
                        'text-400',
                      )}>
                      Tax:
                    </Text>
                    <Text
                      style={applyStyles(
                        {
                          color: colors['gray-300'],
                        },
                        'text-400',
                      )}>
                      {receipt?.tax}
                    </Text>
                  </View>
                  <View
                    style={applyStyles(
                      'flex-row',
                      'items-center',
                      'justify-space-between',
                    )}>
                    <Text
                      style={applyStyles(
                        {
                          color: colors['gray-300'],
                        },
                        'text-400',
                      )}>
                      Total:
                    </Text>
                    <Text style={styles.totalAmountText}>
                      {amountWithCurrency(receipt?.total_amount)}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
        <Button
          variantColor="white"
          onPress={onPrintReceipt}
          style={applyStyles({marginVertical: 32})}>
          <View
            style={applyStyles('flex-row', 'items-center', 'justify-center')}>
            <Icon
              size={24}
              name="printer"
              type="feathericons"
              color={colors['gray-50']}
            />
            <Text
              style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                color: colors['gray-200'],
              })}>
              Print receipt
            </Text>
          </View>
        </Button>
        {!!(receipt?.payments?.length || receipt?.credit_amount) && (
          <View style={applyStyles({paddingBottom: 100})}>
            <Text
              style={applyStyles('pb-lg', 'text-400', {
                fontSize: 18,
                color: colors.primary,
              })}>
              Payments
            </Text>
            <View
              style={applyStyles(
                'flex-row',
                'w-full',
                'justify-space-between',
              )}>
              <View style={applyStyles({width: '48%'})}>
                {allPayments.length ? (
                  allPayments?.map((item) => (
                    <View style={applyStyles('pb-lg')}>
                      <Text
                        style={applyStyles('pb-xs', 'text-400', {
                          color: colors['gray-200'],
                        })}>
                        Paid By {PAYMENT_METHOD_LABEL[item.method]}
                      </Text>
                      <Text
                        style={applyStyles('text-400', {
                          fontSize: 16,
                          color: colors['gray-300'],
                        })}>
                        {amountWithCurrency(item.amount_paid)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text
                    style={applyStyles('text-400', {
                      color: colors['gray-50'],
                    })}>
                    - No payments
                  </Text>
                )}
              </View>
              {!!creditAmountLeft && (
                <View style={applyStyles({width: '48%'})}>
                  <Text
                    style={applyStyles('pb-xs', 'text-400', {
                      color: colors['gray-200'],
                    })}>
                    You are owed
                  </Text>
                  <Text
                    style={applyStyles('text-400', {
                      fontSize: 16,
                      color: colors.primary,
                    })}>
                    {amountWithCurrency(creditAmountLeft)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.actionButtons}>
        <Button
          variantColor="clear"
          style={styles.actionButton}
          onPress={onOpenShareModal}>
          <View
            style={applyStyles('flex-row', 'items-center', 'justify-center')}>
            <Icon
              size={24}
              name="share"
              type="feathericons"
              color={colors['gray-50']}
            />
            <Text
              style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                color: colors['gray-200'],
              })}>
              Share
            </Text>
          </View>
        </Button>
        <Button
          title="Done"
          variantColor="red"
          onPress={onClose}
          style={styles.actionButton}
        />
      </View>

      <CustomerDetailsModal
        customer={customer}
        visible={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        onSelectCustomer={handleSaveCustomer}
        onOpenCustomerList={handleOpenCustomerListModal}
      />

      <Modal animationType="slide" visible={isCustomerListModalOpen}>
        <CustomersList
          customers={customers}
          onCustomerSelect={handleCustomerSelect}
          onModalClose={handleCloseCustomerListModal}
          onOpenContactList={handleOpenContactListModal}
        />
      </Modal>
      <ContactsListModal
        visible={isContactListModalOpen}
        onClose={handleCloseContactListModal}
        onContactSelect={({givenName, familyName, phoneNumbers}) =>
          handleSetCustomer({
            name: `${givenName} ${familyName}`,
            mobile: phoneNumbers[0].number,
          })
        }
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  addProductButtonText: {
    paddingLeft: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    fontFamily: 'Rubik-Regular',
  },
  actionButtons: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderTopColor: colors['gray-20'],
  },
  actionButton: {
    width: '48%',
  },
  statusModalContent: {
    flex: 1,
    marginTop: 32,
    marginBottom: 16,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    marginHorizontal: 16,
    justifyContent: 'center',
    borderBottomColor: colors['gray-20'],
  },
  statusModalIcon: {
    width: 64,
    height: 64,
  },
  statusModalHeadingText: {
    fontSize: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  statusModalDescription: {
    fontSize: 16,
    maxWidth: 260,
    lineHeight: 27,
    textAlign: 'center',
    marginHorizontal: 'auto',
  },
  totalSectionContainer: {
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  totalSection: {
    width: '60%',
  },
  totalAmountText: {
    fontSize: 18,
    color: colors['gray-300'],
    fontFamily: 'Rubik-Medium',
  },
});
