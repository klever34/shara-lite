import React, {useCallback, useState} from 'react';
import {FlatList, Modal, StyleSheet, Text, View} from 'react-native';
import {Button} from '../../../../components';
import EmptyState from '../../../../components/EmptyState';
import Icon from '../../../../components/Icon';
import TextInput from '../../../../components/TextInput';
import Touchable from '../../../../components/Touchable';
import {applyStyles} from '../../../../helpers/utils';
import {IDeliveryAgent} from '../../../../models/DeliveryAgent';
import {getDeliveryAgents} from '../../../../services/DeliveryAgentService';
import {useRealm} from '../../../../services/realm';
import {colors} from '../../../../styles';

type DeliveryAgentItemProps = {
  item: IDeliveryAgent;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectDeliveryAgent: (deliveryAgent: IDeliveryAgent) => void;
};

export const DeliveryAgentsModal = (props: Props) => {
  const realm = useRealm() as Realm;
  const deliveryAgents = getDeliveryAgents({realm});
  const {visible, onClose, onSelectDeliveryAgent} = props;

  const [searchInputValue, setSearchInputValue] = useState('');
  const [myDeliveryAgents, setMyDeliveryAgents] = useState<IDeliveryAgent[]>(
    deliveryAgents,
  );

  const handleClose = useCallback(() => {
    setSearchInputValue('');
    onClose();
  }, [onClose]);

  const handleDeliveryAgentSelect = useCallback(
    (deliveryAgent: IDeliveryAgent) => {
      onSelectDeliveryAgent(deliveryAgent);
      onClose();
    },
    [onClose, onSelectDeliveryAgent],
  );

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

  const renderDeliveryAgentListItem = useCallback(
    ({item: deliveryAgent}: DeliveryAgentItemProps) => {
      return (
        <Touchable onPress={() => handleDeliveryAgentSelect(deliveryAgent)}>
          <View style={styles.deliveryAgentListItem}>
            <Text style={styles.deliveryAgentListItemText}>
              {deliveryAgent.full_name}
            </Text>
          </View>
        </Touchable>
      );
    },
    [handleDeliveryAgentSelect],
  );

  const renderDeliveryAgentListHeader = useCallback(
    () => (
      <Text style={styles.deliveryAgentListHeader}>Select Delivery Agent</Text>
    ),
    [],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onDismiss={handleClose}
      onRequestClose={handleClose}>
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
              style={styles.searchInput}
              placeholder="Search Delivery Agents"
              onChangeText={handleDeliveryAgentSearch}
              placeholderTextColor={colors['gray-50']}
            />
          </View>
        </View>
        <FlatList
          data={myDeliveryAgents}
          keyExtractor={(item) => `${item._id}`}
          renderItem={renderDeliveryAgentListItem}
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
        <Button
          variantColor="clear"
          style={applyStyles('w-full mb-xl', {
            borderTopColor: colors['gray-20'],
            borderTopWidth: 1,
          })}
          onPress={onClose}>
          <Text
            style={applyStyles('text-400', 'text-uppercase', {
              color: colors['gray-200'],
            })}>
            Close
          </Text>
        </Button>
      </View>
    </Modal>
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
