import React, {useCallback, useEffect, useState, useLayoutEffect} from 'react';
import {applyStyles} from '../../../../helpers/utils';
import {colors} from '../../../../styles';
import EmptyState from '../../../../components/EmptyState';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import Icon from '../../../../components/Icon';
import TextInput from '../../../../components/TextInput';
import Touchable from '../../../../components/Touchable';
import {useNavigation} from '@react-navigation/native';
import {useRealm} from '../../../../services/realm';
import {getDeliveryAgents} from '../../../../services/DeliveryAgentService';
import {IDeliveryAgent} from '../../../../models/DeliveryAgent';
import HeaderRight from '../../../../components/HeaderRight';
import {useScreenRecord} from '../../../../services/analytics';

type DeliveryAgentItemProps = {
  item: IDeliveryAgent;
};

export const DeliveryAgents = () => {
  useScreenRecord();
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const deliveryAgents = getDeliveryAgents({realm});

  const [searchInputValue, setSearchInputValue] = useState('');
  const [myDeliveryAgents, setMyDeliveryAgents] = useState<IDeliveryAgent[]>(
    deliveryAgents,
  );

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

  const handleDeliveryAgentSearch = useCallback(
    (searchedText: string) => {
      setSearchInputValue(searchedText);
      if (searchedText) {
        const sort = (item: IDeliveryAgent, text: string) => {
          return item.full_name.toLowerCase().indexOf(text.toLowerCase()) > -1;
        };
        const ac = deliveryAgents.filter((item: IDeliveryAgent) => {
          return sort(item, searchedText);
        });
        setMyDeliveryAgents(ac);
      } else {
        setMyDeliveryAgents(deliveryAgents);
      }
    },
    [deliveryAgents],
  );

  const handleAddDeliveryAgent = useCallback(() => {
    navigation.navigate('AddDeliveryAgent');
  }, [navigation]);

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
    <View style={applyStyles({backgroundColor: colors.white})}>
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
            style={styles.searchInput}
            placeholder="Search Delivery Agents"
            onChangeText={handleDeliveryAgentSearch}
            placeholderTextColor={colors['gray-50']}
          />
        </View>
      </View>
      <Touchable onPress={handleAddDeliveryAgent}>
        <View
          style={applyStyles('flex-row px-lg py-lg items-center', {
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-20'],
          })}>
          <Icon
            size={24}
            name="user-plus"
            type="feathericons"
            color={colors.primary}
          />
          <Text
            style={applyStyles('text-400 pl-md', {
              fontSize: 16,
              color: colors['gray-300'],
            })}>
            Add Delivery Agent
          </Text>
        </View>
      </Touchable>
      <FlatList
        data={myDeliveryAgents}
        renderItem={renderDeliveryAgentListItem}
        keyExtractor={(item) => `${item._id}`}
        style={applyStyles({backgroundColor: colors.white})}
        ListHeaderComponent={renderDeliveryAgentListHeader}
        ListEmptyComponent={
          <EmptyState
            heading={
              !deliveryAgents.length ? 'No Agents Added' : 'No results found'
            }
            source={require('../../../../assets/images/coming-soon.png')}
            text="Click on the add delivery agent button above to create a delivery agent"
          />
        }
      />
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
});
