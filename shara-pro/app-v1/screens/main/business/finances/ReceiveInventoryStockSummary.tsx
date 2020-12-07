import {applyStyles} from 'app-v1/helpers/utils';
import {IDeliveryAgent} from 'app-v1/models/DeliveryAgent';
import {IStockItem} from 'app-v1/models/StockItem';
import {ISupplier} from 'app-v1/models/Supplier';
import {getAnalyticsService} from 'app-v1/services';
import {getDeliveryAgents} from 'app-v1/services/DeliveryAgentService';
import {useErrorHandler} from 'app-v1/services/error-boundary';
import {useRealm} from 'app-v1/services/realm';
import {addNewInventory} from 'app-v1/services/ReceivedInventoryService';
import {colors} from 'app-v1/styles';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {Contact} from 'react-native-contacts';
import {Button, ContactsListModal, PageModal} from '../../../../components';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {AddDeliveryAgent} from './AddDeliveryAgent';

type Payload = IDeliveryAgent;

export type SummaryTableItemProps = {
  item: IStockItem;
};

type Props = {
  supplier: ISupplier;
  onClearReceipt: () => void;
  products: IStockItem[];
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
}: SummaryTableItemProps & {onPress?: (item: IStockItem) => void}) => {
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
  const deliveryAgents = getDeliveryAgents({realm});

  const {products, supplier, onCloseSummaryModal} = props;

  const [isSaving, setIsSaving] = useState(false);
  const [agent, setAgent] = useState<Payload | undefined>();
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);
  const [
    isAddDeliveryAgentModalOpen,
    setIsAddDeliveryAgentModalOpen,
  ] = useState(false);

  const handleOpenContactListModal = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setIsContactListModalOpen(false);
  }, []);

  const handleOpenAddDeliveryAgentModal = useCallback(() => {
    setIsAddDeliveryAgentModalOpen(true);
  }, []);

  const handleCloseAddDeliveryAgentModal = useCallback(() => {
    setIsAddDeliveryAgentModalOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    onCloseSummaryModal();
  }, [onCloseSummaryModal]);

  const handleError = useErrorHandler();

  const handleFinish = () => {
    setIsSaving(true);
    setTimeout(() => {
      addNewInventory({
        realm,
        supplier,
        stockItems: products,
        delivery_agent: agent,
      });
      getAnalyticsService().logEvent('inventoryReceived').catch(handleError);
      setIsSaving(false);
      clearForm();
      handleCancel();
      navigation.navigate('ReceivedInventoryList');
      ToastAndroid.show('Inventory recorded', ToastAndroid.SHORT);
    }, 300);
  };

  const handleSetDeliveryAgent = useCallback(
    (deliveryAgent: IDeliveryAgent) => {
      setAgent(deliveryAgent);
    },
    [],
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
      <ScrollView
        persistentScrollbar={true}
        style={styles.scrollView}
        nestedScrollEnabled>
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
        <Button
          variantColor="white"
          onPress={handleCancel}
          style={applyStyles('mt-lg mb-xl')}>
          <View style={applyStyles('items-center flex-row justify-center')}>
            <Icon
              size={24}
              name="plus"
              type="feathericons"
              color={colors.primary}
            />
            <Text
              style={applyStyles('text-400', 'pl-md', 'text-uppercase', {
                color: colors['gray-200'],
              })}>
              Add product
            </Text>
          </View>
        </Button>
        <Text
          style={applyStyles('mt-xl mb-lg text-center text-400', {
            fontSize: 18,
            color: colors.primary,
          })}>
          Delivery Agent Details (optional)
        </Text>
        {!agent && (
          <Button
            style={applyStyles('mb-lg')}
            onPress={handleOpenContactListModal}>
            <View
              style={applyStyles('flex-row', 'items-center', 'justify-center')}>
              <Icon
                size={24}
                name="user"
                type="feathericons"
                color={colors.white}
              />
              <Text
                style={applyStyles('text-400', 'pl-md', 'text-uppercase', {
                  color: colors.white,
                })}>
                Select delivery agent
              </Text>
            </View>
          </Button>
        )}

        {agent && (
          <View style={applyStyles('w-full')}>
            <Text
              style={applyStyles('pb-sm text-400 text-center text-uppercase', {
                fontSize: 18,
                color: colors['gray-300'],
              })}>
              {agent?.full_name}
            </Text>
            <Text
              style={applyStyles('pb-md text-400 text-center', {
                color: colors['gray-300'],
              })}>
              {agent?.mobile}
            </Text>
            <Touchable onPress={handleOpenContactListModal}>
              <View
                style={applyStyles(
                  'w-full flex-row items-center justify-center',
                  {
                    paddingVertical: 16,
                  },
                )}>
                <Icon
                  size={24}
                  name="edit"
                  type="feathericons"
                  color={colors.primary}
                />
                <Text
                  style={applyStyles('pl-md text-400 text-uppercase', {
                    color: colors.primary,
                  })}>
                  Change delivery agent
                </Text>
              </View>
            </Touchable>
          </View>
        )}
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
      <ContactsListModal<IDeliveryAgent>
        entity="Delivery Agent"
        createdData={deliveryAgents}
        visible={isContactListModalOpen}
        onClose={handleCloseContactListModal}
        onAddNew={handleOpenAddDeliveryAgentModal}
        onContactSelect={(contact) => handleSelectContact(contact)}
      />

      <PageModal
        title="Add Delivery Agent"
        visible={isAddDeliveryAgentModalOpen}
        onClose={handleCloseAddDeliveryAgentModal}>
        <AddDeliveryAgent
          onSubmit={(deliveryAgent) => {
            handleSetDeliveryAgent(deliveryAgent);
            handleCloseAddDeliveryAgentModal();
          }}
        />
      </PageModal>
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
