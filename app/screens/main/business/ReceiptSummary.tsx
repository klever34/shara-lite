import {Picker} from '@react-native-community/picker';
import format from 'date-fns/format';
import {useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  ImageProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {MainStackParamList} from '..';
import {Button} from '../../../components/Button';
import {FloatingLabelInput} from '../../../components/FloatingLabelInput';
import Icon from '../../../components/Icon';
import AppMenu from '../../../components/Menu';
import Touchable from '../../../components/Touchable';
import {
  applyStyles,
  numberWithCommas,
  generateUniqueId,
} from '../../../helpers/utils';
import {ICustomer} from '../../../models';
import {savePayment} from '../../../services/PaymentService';
import {useRealm} from '../../../services/realm';
import {colors} from '../../../styles';
import {ContactsListModal} from '../../../components/ContactsListModal';
import {Contact} from 'react-native-contacts';

type SummaryTableItemProps = {
  item: ReceiptItem;
};

type CreditPayload = {
  amount: string;
  paymentMethod: string | number;
};

type StatusProps = {
  [key: string]: PageProps;
};

type PageProps = {
  heading: string;
  buttonText: string;
  closeButtonColor: string;
  icon: ImageProps['source'];
  buttonVariant: 'red' | 'white';
  style: {container: ViewStyle; text: TextStyle; heading: TextStyle};
};

const summaryTableStyles = StyleSheet.create({
  row: {
    flexWrap: 'wrap',
    marginBottom: 12,
    paddingBottom: 12,
    flexDirection: 'row',
  },
  'column-20': {
    width: '20%',
  },
  'column-40': {
    width: '40%',
  },
});

const summaryTableHeaderStyles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-900'],
  },
  text: {
    fontFamily: 'Rubik-Medium',
    color: colors['gray-300'],
  },
});

const summaryTableItemStyles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-20'],
  },
  text: {
    fontSize: 16,
    paddingBottom: 4,
    fontFamily: 'Rubik-Regular',
    color: colors['gray-300'],
  },
  subText: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
    color: colors['gray-200'],
  },
});

const paymentTypes = ['Cash', 'Bank Transfer', 'Mobile Money'];

const SummaryTableHeader = () => {
  return (
    <View
      style={applyStyles(summaryTableStyles.row, summaryTableHeaderStyles.row)}>
      <View style={summaryTableStyles['column-40']}>
        <Text style={summaryTableHeaderStyles.text}>Description</Text>
      </View>
      <View
        style={applyStyles(summaryTableStyles['column-20'], {
          alignItems: 'flex-end',
        })}>
        <Text style={summaryTableHeaderStyles.text}>Qty</Text>
      </View>
      <View
        style={applyStyles(summaryTableStyles['column-40'], {
          alignItems: 'flex-end',
        })}>
        <Text style={summaryTableHeaderStyles.text}>Subtotal</Text>
      </View>
    </View>
  );
};

const SummaryTableItem = ({item}: SummaryTableItemProps) => {
  const price = item.price ? parseFloat(item.price) : 0;
  const quantity = item.quantity ? parseFloat(item.quantity) : 0;
  const subtotal = price * quantity;

  return (
    <View
      style={applyStyles(summaryTableStyles.row, summaryTableItemStyles.row)}>
      <View style={summaryTableStyles['column-40']}>
        <Text style={summaryTableItemStyles.text}>
          {item.name} ({item.weight})
        </Text>
        <Text style={summaryTableItemStyles.subText}>
          &#8358;{numberWithCommas(price)} Per Unit
        </Text>
      </View>
      <View
        style={applyStyles(summaryTableStyles['column-20'], {
          alignItems: 'flex-end',
        })}>
        <Text style={summaryTableItemStyles.text}>{quantity}</Text>
      </View>
      <View
        style={applyStyles(summaryTableStyles['column-40'], {
          alignItems: 'flex-end',
        })}>
        <Text style={summaryTableItemStyles.text}>
          &#8358;{numberWithCommas(subtotal)}
        </Text>
      </View>
    </View>
  );
};

const ReceiptSummary = ({
  route,
}: StackScreenProps<MainStackParamList, 'ReceiptSummary'>) => {
  const navigation = useNavigation();
  const realm = useRealm();

  const {customer: customerProps, products} = route.params;
  const tax = 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState(paymentTypes[0]);
  const [amountPaid, setAmountPaid] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [customer, setCustomer] = useState<Customer | ICustomer>(
    customerProps || ({} as Customer),
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);
  const creditAmount = totalAmount - amountPaid;

  //@ts-ignore
  const timeTaken = new Date().getTime() - global.startTime;

  const statusProps: StatusProps = {
    success: {
      heading: 'Success!',
      buttonText: 'Done',
      closeButtonColor: colors.primary,
      icon: require('../../../assets/icons/check-circle.png'),
      buttonVariant: 'red',
      style: {
        text: {color: colors['gray-200']},
        heading: {color: colors['gray-300']},
        container: {backgroundColor: colors.white},
      },
    },
    error: {
      heading: 'Error!',
      buttonText: 'Retry',
      closeButtonColor: colors.white,
      icon: require('../../../assets/icons/x-circle.png'),
      buttonVariant: 'white',
      style: {
        text: {color: colors.white},
        heading: {color: colors.white},
        container: {backgroundColor: colors.primary},
      },
    },
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <AppMenu options={[]} />,
    });
  }, [navigation]);

  const handleCancel = useCallback(() => {
    navigation.navigate('NewReceipt');
  }, [navigation]);

  const handleAddProduct = useCallback(() => {
    navigation.navigate('NewReceipt');
  }, [navigation]);

  const handlePaymentTypeChange = useCallback((value: string | number) => {
    setPaymentType(value.toString());
  }, []);

  const handleAmountPaidChange = useCallback((value: string | number) => {
    // @TODO Improve conversion
    setAmountPaid(parseFloat(value.toString().replace(/,/g, '')));
  }, []);

  const handleOpenSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(true);
  }, []);

  const handleCloseSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);

  const handleOpenShareModal = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setIsShareModalOpen(false);
  }, []);

  const handleOpenCustomerModal = useCallback(() => {
    setIsCustomerModalOpen(true);
  }, []);

  const handleCloseCustomerModal = useCallback(() => {
    setIsCustomerModalOpen(false);
  }, []);

  const handleCustomerSelect = useCallback(
    ({givenName, familyName, phoneNumbers}: Contact) => {
      setCustomer({
        created_at: new Date(),
        id: generateUniqueId(),
        mobile: phoneNumbers[0].number,
        name: `${givenName} ${familyName}`,
      });
    },
    [setCustomer],
  );

  const handleUpdateCustomer = useCallback(
    (value, key) => {
      setCustomer({...customer, [key]: value});
    },
    [customer],
  );

  const handleOpenContactList = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactList = useCallback(() => {
    setIsContactListModalOpen(false);
  }, []);

  const handleFinish = () => {
    setIsSubmitting(true);
    savePayment({
      realm,
      customer,
      type: paymentType,
      amountPaid,
      totalAmount,
      creditAmount,
      tax,
      products,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      handleOpenSuccessModal();
    }, 2000);
  };

  const handleComplete = useCallback(() => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleCloseSuccessModal();
      navigation.navigate('NewReceipt');
    }, 2000);
  }, [navigation, handleCloseSuccessModal]);

  useEffect(() => {
    const total = products
      .map(({quantity, price}) => {
        const itemPrice = price ? parseFloat(price) : 0;
        const itemQuantity = quantity ? parseFloat(quantity) : 0;
        return itemPrice * itemQuantity;
      })
      .reduce((acc, curr) => acc + curr, 0);

    setTotalAmount(total);
    setAmountPaid(total);
  }, [products]);

  const renderSummaryItem = useCallback(
    ({item}: SummaryTableItemProps) => <SummaryTableItem item={item} />,
    [],
  );

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView style={styles.scrollView} nestedScrollEnabled>
        <View>
          <Text style={styles.sectionTitle}>Products</Text>
          <View>
            <FlatList
              data={products}
              nestedScrollEnabled
              renderItem={renderSummaryItem}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={SummaryTableHeader}
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
                  <Text>{tax}</Text>
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
                    &#8358;{numberWithCommas(totalAmount)}
                  </Text>
                </View>
              </View>
            </View>
            <Touchable onPress={handleAddProduct}>
              <View style={styles.addProductButton}>
                <Icon
                  size={24}
                  type="ionicons"
                  name={
                    Platform.select({
                      android: 'md-add',
                      ios: 'ios-add',
                    }) as string
                  }
                  color={colors.primary}
                />
                <Text style={styles.addProductButtonText}>Add a product</Text>
              </View>
            </Touchable>
          </View>
        </View>
        <View style={applyStyles({marginVertical: 24})}>
          <View style={styles.pickerContainer}>
            <Text style={applyStyles('text-400', styles.pickerLabel)}>
              Select Payment method
            </Text>
            <Picker
              mode="dropdown"
              style={styles.picker}
              prompt="Payment Method"
              itemStyle={styles.pickerItem}
              selectedValue={paymentType}
              onValueChange={(itemValue) => handlePaymentTypeChange(itemValue)}>
              {paymentTypes.map((type: string, index) => (
                <Picker.Item label={type} value={type} key={index} />
              ))}
            </Picker>
          </View>
          <View style={applyStyles('flex-row', 'items-center')}>
            <FloatingLabelInput
              label="Amount Paid"
              keyboardType="number-pad"
              containerStyle={applyStyles({marginBottom: 12})}
              value={numberWithCommas(amountPaid)}
              onChangeText={(text) => handleAmountPaidChange(text)}
              leftIcon={
                <Text style={applyStyles(styles.textInputIconText, 'text-400')}>
                  &#8358;
                </Text>
              }
            />
          </View>
          <FloatingLabelInput
            editable={false}
            label="Credit remaining"
            keyboardType="number-pad"
            inputStyle={applyStyles({color: colors.primary})}
            value={numberWithCommas(creditAmount)}
            leftIcon={
              <Text
                style={applyStyles(
                  styles.textInputIconText,
                  {color: colors.primary},
                  'text-400',
                )}>
                &#8358;
              </Text>
            }
          />
        </View>

        <View style={applyStyles({marginBottom: 40})}>
          <View
            style={applyStyles('items-center, justify-center', {
              marginBottom: 16,
            })}>
            <Text
              style={applyStyles('text-400', 'text-center', {
                color: colors['gray-100'],
              })}>
              Are they paying via multiple methods?
            </Text>
          </View>

          <Touchable onPress={handleAddProduct}>
            <View
              style={applyStyles('flex-row', 'items-center', 'justify-center', {
                paddingVertical: 16,
              })}>
              <Icon
                size={24}
                type="ionicons"
                name={
                  Platform.select({
                    android: 'md-add',
                    ios: 'ios-add',
                  }) as string
                }
                color={colors.primary}
              />
              <Text style={styles.addProductButtonText}>
                Add payment method
              </Text>
            </View>
          </Touchable>
        </View>
      </ScrollView>
      <View style={styles.actionButtons}>
        <Button
          title="Cancel"
          variantColor="clear"
          onPress={handleCancel}
          style={styles.actionButton}
        />
        <Button
          title="Done"
          variantColor="red"
          onPress={handleFinish}
          isLoading={isSubmitting}
          style={styles.actionButton}
        />
      </View>

      <Modal
        transparent={false}
        animationType="slide"
        visible={isSuccessModalOpen}>
        <ScrollView>
          <View style={styles.statusModalContent}>
            <Image
              source={statusProps.success.icon}
              style={applyStyles('mb-xl', styles.statusModalIcon)}
            />
            <Text
              style={applyStyles(
                'pb-sm',
                styles.statusModalHeadingText,
                statusProps.success.style.heading,
                'heading-700',
              )}>
              {statusProps.success.heading}
            </Text>
            <Text
              style={applyStyles(
                styles.statusModalDescription,
                statusProps.success.style.text,
                'text-400',
              )}>
              {`You have successfully issued a receipt for N${numberWithCommas(
                amountPaid,
              )} in Cash and N${numberWithCommas(creditAmount)} in Credit`}
            </Text>
            <Text
              style={applyStyles(
                styles.statusModalDescription,
                statusProps.success.style.text,
                'text-400',
              )}>
              Time taken: {format(timeTaken, 'mm:ss')}
            </Text>
          </View>

          <View style={applyStyles({marginBottom: 40, paddingHorizontal: 16})}>
            <View
              style={applyStyles('items-center, justify-center', {
                marginBottom: 16,
              })}>
              <Text
                style={applyStyles('text-400', 'text-center', {
                  color: colors['gray-100'],
                })}>
                Do you want to add the customers' details?
              </Text>
            </View>

            <Touchable onPress={handleOpenCustomerModal}>
              <View
                style={applyStyles(
                  'flex-row',
                  'items-center',
                  'justify-center',
                  {paddingVertical: 16},
                )}>
                <Icon
                  size={24}
                  type="ionicons"
                  name={
                    Platform.select({
                      android: 'md-add',
                      ios: 'ios-add',
                    }) as string
                  }
                  color={colors.primary}
                />
                <Text style={styles.addProductButtonText}>
                  Add customer details
                </Text>
              </View>
            </Touchable>
            <Button
              onPress={() => {}}
              variantColor="white"
              style={applyStyles({marginTop: 24})}>
              <View
                style={applyStyles(
                  'flex-row',
                  'items-center',
                  'justify-center',
                )}>
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
          </View>
        </ScrollView>
        <View style={styles.actionButtons}>
          <Button
            variantColor="clear"
            style={styles.actionButton}
            onPress={handleOpenShareModal}>
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
            title="Finish"
            variantColor="red"
            isLoading={isSubmitting}
            onPress={handleComplete}
            style={styles.actionButton}
          />
        </View>
      </Modal>

      <Modal
        transparent={false}
        animationType="slide"
        visible={isCustomerModalOpen}>
        <ScrollView style={applyStyles('px-lg', {paddingVertical: 48})}>
          <View style={applyStyles({marginBottom: 48})}>
            <Text
              style={applyStyles('mb-xl', 'text-400', {
                fontSize: 18,
                color: colors.primary,
              })}>
              Customer Details
            </Text>

            <Touchable onPress={handleOpenContactList}>
              <View
                style={applyStyles(
                  'px-lg',
                  'pt-md',
                  'pb-lg',
                  'mb-lg',
                  'flex-row',
                  'items-center',
                  'justify-space-between',
                  {borderBottomColor: colors['gray-50'], borderBottomWidth: 1},
                )}>
                <Text
                  style={applyStyles({
                    fontSize: 16,
                    color: colors['gray-100'],
                  })}>
                  Select from contacts
                </Text>
                <Icon
                  size={24}
                  name="users"
                  type="feathericons"
                  color={colors['gray-100']}
                />
              </View>
            </Touchable>
          </View>
          <View>
            <FloatingLabelInput
              value={customer.name}
              label="Type Customer Name"
              containerStyle={applyStyles('pb-md')}
              onChangeText={(text) => handleUpdateCustomer(text, 'name')}
            />
            <FloatingLabelInput
              label="Phone number"
              value={customer.mobile}
              keyboardType="number-pad"
              containerStyle={applyStyles({paddingBottom: 80})}
              onChangeText={(text) => handleUpdateCustomer(text, 'mobile')}
            />
          </View>
        </ScrollView>
        <View style={styles.actionButtons}>
          <Button
            variantColor="clear"
            style={styles.actionButton}
            onPress={handleCloseCustomerModal}>
            <Text
              style={applyStyles('text-400', 'text-uppercase', {
                color: colors['gray-200'],
              })}>
              Cancel
            </Text>
          </Button>
          <Button
            title="Done"
            variantColor="red"
            style={styles.actionButton}
            onPress={handleCloseCustomerModal}
          />
        </View>
      </Modal>

      <Modal
        transparent={false}
        animationType="slide"
        visible={isShareModalOpen}>
        <View
          style={applyStyles(
            'px-lg',
            'flex-1',
            'items-center',
            'justify-center',
          )}>
          <Text
            style={applyStyles('text-400', 'pb-md', 'text-center', {
              fontSize: 18,
              color: colors.primary,
            })}>
            Select a sharing option
          </Text>

          <Button
            variantColor="white"
            style={applyStyles('w-full', 'mb-md')}
            onPress={handleOpenShareModal}>
            <View
              style={applyStyles('flex-row', 'items-center', 'justify-center')}>
              <Icon
                size={24}
                name="mail"
                type="feathericons"
                color={colors.primary}
              />
              <Text
                style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                  color: colors['gray-200'],
                })}>
                Share via email
              </Text>
            </View>
          </Button>
          <Button
            variantColor="white"
            style={applyStyles('w-full', 'mb-xl')}
            onPress={handleOpenShareModal}>
            <View
              style={applyStyles('flex-row', 'items-center', 'justify-center')}>
              <Icon
                size={24}
                name="message-circle"
                type="feathericons"
                color={colors.primary}
              />
              <Text
                style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                  color: colors['gray-200'],
                })}>
                Share via sms
              </Text>
            </View>
          </Button>
          <View
            style={applyStyles('pt-xl', 'w-full', {
              borderTopWidth: 1,
              borderTopColor: colors['gray-20'],
            })}>
            <Button
              variantColor="white"
              style={applyStyles('w-full', 'mb-md', {
                backgroundColor: '#1BA058',
              })}
              onPress={handleOpenShareModal}>
              <View
                style={applyStyles(
                  'flex-row',
                  'items-center',
                  'justify-center',
                )}>
                <Icon
                  size={24}
                  name="logo-whatsapp"
                  type="ionicons"
                  color={colors.white}
                />
                <Text
                  style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                    color: colors.white,
                  })}>
                  Share via whatsapp
                </Text>
              </View>
            </Button>
          </View>
        </View>

        <View style={applyStyles('px-lg')}>
          <Button
            variantColor="clear"
            style={applyStyles({width: '100%', marginBottom: 24})}
            onPress={handleCloseShareModal}>
            <Text
              style={applyStyles('text-400', 'text-uppercase', {
                color: colors['gray-200'],
              })}>
              Cancel
            </Text>
          </Button>
        </View>
      </Modal>

      <ContactsListModal
        visible={isContactListModalOpen}
        onClose={handleCloseContactList}
        onContactSelect={handleCustomerSelect}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    paddingBottom: 12,
    color: colors.primary,
    fontFamily: 'Rubik-Medium',
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
  addProductButton: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    justifyContent: 'center',
    borderTopColor: colors['gray-20'],
    borderBottomColor: colors['gray-20'],
  },
  addPaymentButton: {
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selectCustomerButton: {
    marginBottom: 24,
  },
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
  input: {
    marginBottom: 16,
  },
  buttonStyle: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextStyle: {
    fontSize: 16,
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors['gray-200'],
  },
  pickerLabel: {
    color: colors['gray-100'],
  },
  picker: {
    paddingBottom: 12,
    fontFamily: 'Rubik-Regular',
  },
  pickerItem: {
    color: colors['gray-300'],
    fontFamily: 'Rubik-Regular',
  },
  textInputIconText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
  creditText: {
    marginTop: 3,
    color: colors.primary,
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
});

export default ReceiptSummary;
