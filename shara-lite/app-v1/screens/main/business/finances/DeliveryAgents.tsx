import {ContactsListModal, FAButton} from 'app-v1/components';
import {getAnalyticsService} from 'app-v1/services';
import {useNavigation} from '@react-navigation/native';
import orderBy from 'lodash/orderBy';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {Contact} from 'react-native-contacts';
import EmptyState from '../../../../components/EmptyState';
import HeaderRight from '../../../../components/HeaderRight';
import Icon from '../../../../components/Icon';
import TextInput from '../../../../components/TextInput';
import Touchable from '../../../../components/Touchable';
import {applyStyles} from 'app-v1/helpers/utils';
import {IDeliveryAgent} from 'app-v1/models/DeliveryAgent';
import {
  getDeliveryAgents,
  saveDeliveryAgent,
} from 'app-v1/services/DeliveryAgentService';
import {useRealm} from 'app-v1/services/realm';
import {colors} from 'app-v1/styles';

type DeliveryAgentItemProps = {
  item: IDeliveryAgent;
};

export const DeliveryAgents = () => {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const analyticsService = getAnalyticsService();
  const deliveryAgents = getDeliveryAgents({realm});

  const [searchInputValue, setSearchInputValue] = useState('');
  const [myDeliveryAgents, setMyDeliveryAgents] = useState<IDeliveryAgent[]>(
    deliveryAgents,
  );
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const deliveryAgentsData = getDeliveryAgents({realm});
      setMyDeliveryAgents(deliveryAgentsData);
    });
    return unsubscribe;
  }, [navigation, realm]);

  const handleOpenContactListModal = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setIsContactListModalOpen(false);
  }, []);

  const handleDeliveryAgentSearch = useCallback(
    (searchedText: string) => {
      setSearchInputValue(searchedText);
      if (searchedText) {
        const searchValue = searchedText.trim();
        const sort = (item: IDeliveryAgent, text: string) => {
          return item.full_name.toLowerCase().indexOf(text.toLowerCase()) > -1;
        };
        const ac = deliveryAgents.filter((item: IDeliveryAgent) => {
          return sort(item, searchValue);
        });
        setMyDeliveryAgents(ac);
      } else {
        setMyDeliveryAgents(deliveryAgents);
      }
      analyticsService
        .logEvent('search', {
          search_term: searchedText,
          content_type: 'deliveryAgent',
        })
        .then(() => {});
    },
    [deliveryAgents, analyticsService],
  );

  const handleAddDeliveryAgent = useCallback(() => {
    navigation.navigate('AddDeliveryAgent');
  }, [navigation]);

  const handleCreateDeliveryAgent = useCallback(
    (contact: Contact) => {
      const mobile = contact.phoneNumbers[0].number;
      const name = `${contact.givenName} ${contact.familyName}`;

      if (deliveryAgents.map((item) => item.mobile).includes(mobile)) {
        Alert.alert(
          'Error',
          'Delivery Agent with the same phone number has been created.',
        );
      } else {
        const deliveryAgent = {full_name: name, mobile};
        saveDeliveryAgent({realm, delivery_agent: deliveryAgent});
        ToastAndroid.show('Delivery agent added', ToastAndroid.SHORT);
      }
    },
    [deliveryAgents, realm],
  );

  const renderDeliveryAgentListItem = useCallback(
    ({item: deliveryAgent}: DeliveryAgentItemProps) => {
      return (
        <Touchable>
          <View style={styles.deliveryAgentListItem}>
            <Text style={styles.deliveryAgentListItemText}>
              {deliveryAgent.full_name}
            </Text>
          </View>
        </Touchable>
      );
    },
    [],
  );

  const renderDeliveryAgentListHeader = useCallback(
    () => (
      <Text style={styles.deliveryAgentListHeader}>Delivery Agent List</Text>
    ),
    [],
  );

  return (
    <View style={applyStyles('flex-1', {backgroundColor: colors.white})}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            size={24}
            name="search"
            type="feathericons"
            color={colors.primary}
            style={styles.searchInputIcon}
          />
          <TextInput
            value={searchInputValue}
            containerStyle={styles.searchInput}
            placeholder="Search Delivery Agents"
            onChangeText={handleDeliveryAgentSearch}
            placeholderTextColor={colors['gray-50']}
          />
        </View>
      </View>
      <FlatList
        renderItem={renderDeliveryAgentListItem}
        keyExtractor={(item) => `${item._id}`}
        data={orderBy(myDeliveryAgents, 'full_name', 'asc')}
        style={applyStyles({backgroundColor: colors.white})}
        ListHeaderComponent={renderDeliveryAgentListHeader}
        ListEmptyComponent={
          <EmptyState
            heading={
              !deliveryAgents.length ? 'No Agents Added' : 'No results found'
            }
            style={applyStyles({marginTop: 100})}
            source={require('../../../../assets/images/coming-soon.png')}
            text="Click on the add delivery agent button above to create a delivery agent"
          />
        }
      />
      <ContactsListModal<IDeliveryAgent>
        entity="Delivery Agent"
        createdData={deliveryAgents}
        visible={isContactListModalOpen}
        onAddNew={handleAddDeliveryAgent}
        onClose={handleCloseContactListModal}
        onContactSelect={(contact) => handleCreateDeliveryAgent(contact)}
      />
      <FAButton style={styles.fabButton} onPress={handleOpenContactListModal}>
        <View style={styles.fabButtonContent}>
          <Icon size={18} name="plus" color="white" type="feathericons" />
          <Text style={applyStyles(styles.fabButtonText, 'text-400')}>
            Create delivery agent
          </Text>
        </View>
      </FAButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  searchContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
  },
  searchInputContainer: {
    position: 'relative',
  },
  searchInputIcon: {
    top: 12,
    left: 10,
    elevation: 3,
    position: 'absolute',
  },
  searchInput: {
    height: 48,
    elevation: 2,
    fontSize: 16,
    borderRadius: 8,
    paddingLeft: 36,
    backgroundColor: colors.white,
  },
  deliveryAgentListHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    textTransform: 'uppercase',
    color: colors['gray-300'],
    fontFamily: 'Rubik-Regular',
    borderBottomColor: colors['gray-20'],
  },
  deliveryAgentListItem: {
    fontSize: 16,
    padding: 16,
    borderBottomWidth: 1,
    fontFamily: 'Rubik-Regular',
    borderBottomColor: colors['gray-20'],
  },
  deliveryAgentListItemText: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    color: colors['gray-300'],
  },
  fabButton: {
    height: 48,
    width: 'auto',
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabButtonText: {
    fontSize: 16,
    paddingLeft: 8,
    color: colors.white,
    textTransform: 'uppercase',
  },
});
