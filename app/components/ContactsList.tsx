import React, {useCallback} from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItemInfo,
  Text,
  View,
} from 'react-native';
import {useRealm} from '../services/realm';
import {IContact} from '../models';
import Touchable from './Touchable';
import {applyStyles} from '../helpers/utils';
import PlaceholderImage from './PlaceholderImage';

type ContactsListProps = Omit<
  FlatListProps<IContact>,
  'data' | 'renderItem' | 'keyExtractor'
> & {
  onContactItemClick: (item: IContact) => void;
};

const ContactsList = ({
  onContactItemClick,
  ...restProps
}: ContactsListProps) => {
  const realm = useRealm() as Realm;
  const contacts = realm.objects<IContact>('Contact').sorted('firstname');
  const renderContactItem = useCallback(
    ({item}: ListRenderItemInfo<IContact>) => {
      return (
        <Touchable
          onPress={() => {
            onContactItemClick(item);
          }}>
          <View style={applyStyles('flex-row items-center px-md')}>
            <PlaceholderImage
              text={item.fullName}
              style={applyStyles('mr-md my-md')}
            />
            <Text style={applyStyles('text-lg', 'font-bold')}>
              {item.fullName}
            </Text>
          </View>
        </Touchable>
      );
    },
    [onContactItemClick],
  );
  return (
    <FlatList
      {...restProps}
      data={contacts}
      renderItem={renderContactItem}
      keyExtractor={(item: IContact) => item.mobile}
    />
  );
};

export default ContactsList;
