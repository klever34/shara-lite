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
  filter?: string;
  onContactItemClick: (item: IContact) => void;
};

const ContactsList = ({
  filter,
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
            <Text style={applyStyles('text-lg')}>{item.fullName}</Text>
          </View>
        </Touchable>
      );
    },
    [onContactItemClick],
  );
  return (
    <FlatList
      {...restProps}
      data={filter ? contacts.filtered(filter) : contacts}
      renderItem={renderContactItem}
      keyExtractor={(item: IContact) => item.mobile}
    />
  );
};

export default ContactsList;
