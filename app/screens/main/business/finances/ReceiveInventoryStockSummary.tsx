import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Contact} from 'react-native-contacts';
import {InventoryStockItem} from '../../../../../types/app';
import {
  Button,
  ContactsListModal,
  FloatingLabelInput,
} from '../../../../components';
import Touchable from '../../../../components/Touchable';
import {applyStyles} from '../../../../helpers/utils';
import {IDeliveryAgent} from '../../../../models/DeliveryAgent';
import {ISupplier} from '../../../../models/Supplier';
import {useRealm} from '../../../../services/realm';
import {addNewInventory} from '../../../../services/ReceivedInventoryService';
import {colors} from '../../../../styles';

type Payload = Pick<IDeliveryAgent, 'full_name' | 'mobile'>;

export type SummaryTableItemProps = {
  item: InventoryStockItem;
};

type Props = {
  supplier: ISupplier;
  onClearReceipt: () => void;
  products: InventoryStockItem[];
  onCloseSummaryModal: () => void;
};

export const summaryTableStyles = StyleSheet.create({
  row: {
    flexWrap: 'wrap',
    marginBottom: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export const summaryTableHeaderStyles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-900'],
  },
  text: {
    fontFamily: 'Rubik-Medium',
    color: colors['gray-300'],
  },
});

export const summaryTableItemStyles = StyleSheet.create({
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

export const SummaryTableHeader = () => {
  return (
    <View
      style={applyStyles(summaryTableStyles.row, summaryTableHeaderStyles.row)}>
      <View>
        <Text style={summaryTableHeaderStyles.text}>Description</Text>
      </View>
      <View
        style={applyStyles({
          alignItems: 'flex-end',
        })}>
        <Text style={summaryTableHeaderStyles.text}>Quantity</Text>
      </View>
    </View>
  );
};

export const SummaryTableItem = ({
  item,
  onPress,
}: SummaryTableItemProps & {onPress?: (item: InventoryStockItem) => void}) => {
  return (
    <Touchable onPress={onPress ? () => onPress(item) : () => {}}>
      <View
        style={applyStyles(summaryTableStyles.row, summaryTableItemStyles.row)}>
        <View>
          <Text style={summaryTableItemStyles.text}>
            {item.product.name}{' '}
            {item.product.weight ? `(${item.product.weight})` : ''}
          </Text>
        </View>
        <View
          style={applyStyles({
            alignItems: 'flex-end',
          })}>
          <Text style={summaryTableItemStyles.text}>{item.quantity}</Text>
        </View>
      </View>
    </Touchable>
  );
};

export const ReceiveInventoryStockSummary = (props: Props) => {
  const realm = useRealm();
  const navigation = useNavigation();

  const {products, supplier, onCloseSummaryModal} = props;

  const [isSaving, setIsSaving] = useState(false);
  const [agent, setAgent] = useState<Payload>({} as Payload);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);

  const handleOpenContactListModal = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setIsContactListModalOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    onCloseSummaryModal();
  }, [onCloseSummaryModal]);

  const handleFinish = () => {
    setIsSaving(true);
    setTimeout(() => {
      addNewInventory({
        realm,
        supplier,
        stockItems: products,
        delivery_agent: agent,
      });
      setIsSaving(false);
      clearForm();
      navigation.navigate('Finances', {screen: 'ReceivedInventoryList'});
    }, 300);
  };

  const handleChange = useCallback(
    (value: string | number, key: keyof Payload) => {
      setAgent({
        ...agent,
        [key]: value,
      });
    },
    [agent],
  );

  const handleSelectContact = useCallback((contact: Contact) => {
    const {givenName, familyName, phoneNumbers} = contact;
    const contactName = `${givenName} ${familyName}`;
    const contactMobile = phoneNumbers[0].number;
    setAgent({full_name: contactName, mobile: contactMobile});
  }, []);

  const clearForm = useCallback(() => {
    setAgent({} as Payload);
  }, []);

  const renderSummaryItem = useCallback(
    ({item}: SummaryTableItemProps) => <SummaryTableItem item={item} />,
    [],
  );

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView style={styles.scrollView} nestedScrollEnabled>
        <View>
          <Text style={applyStyles('pb-xl', styles.sectionTitle)}>
            Products
          </Text>
          <View>
            <FlatList
              data={products}
              nestedScrollEnabled
              renderItem={renderSummaryItem}
              ListHeaderComponent={SummaryTableHeader}
              keyExtractor={(item, index) => `${item.product.name}-${index}`}
            />
          </View>
        </View>
        <Text
          style={applyStyles('mt-xl mb-lg text-400', {
            fontSize: 18,
            color: colors.primary,
          })}>
          Delivery Agent Details
        </Text>
        <View style={applyStyles({marginBottom: 48})}>
          <View style={applyStyles('mb-md flex-row', 'items-center')}>
            <FloatingLabelInput
              label="Phone Number"
              keyboardType="phone-pad"
              value={agent.mobile}
              onChangeText={(text) => handleChange(text, 'mobile')}
            />
          </View>
          <Touchable onPress={handleOpenContactListModal}>
            <View style={applyStyles('w-full flex-row justify-end')}>
              <Text style={applyStyles('text-500', {color: colors.primary})}>
                Add from contacts
              </Text>
            </View>
          </Touchable>
          <View style={applyStyles('flex-row', 'items-center')}>
            <FloatingLabelInput
              label="Full Name"
              value={agent.full_name}
              onChangeText={(text) => handleChange(text, 'full_name')}
            />
          </View>
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
          title="Finish"
          variantColor="red"
          isLoading={isSaving}
          onPress={handleFinish}
          style={styles.actionButton}
        />
      </View>
      <ContactsListModal
        visible={isContactListModalOpen}
        onClose={handleCloseContactListModal}
        onContactSelect={(contact) => handleSelectContact(contact)}
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
  textInputIconText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
});
