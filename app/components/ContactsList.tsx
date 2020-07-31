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
import {Collection} from 'realm';
import {getAuthService} from '../services';

type ContactsListProps = Omit<
  FlatListProps<IContact>,
  'data' | 'renderItem' | 'keyExtractor'
> & {
  contacts: Collection<IContact>;
  getContactItemTitle?: (item: IContact) => string;
  onContactItemClick: (item: IContact) => void;
};

const ContactsList = ({
  contacts,
  getContactItemTitle = (item: IContact) => item.fullName,
  onContactItemClick,
  ...restProps
}: ContactsListProps) => {
  const realm = useRealm() as Realm;
  contacts =
    contacts ??
    realm
      .objects<IContact>('Contact')
      .filtered(`mobile != "${getAuthService().getUser()?.mobile ?? ''}"`)
      .sorted('firstname');
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
            <Text style={applyStyles('text-lg')}>
              {getContactItemTitle(item)}
            </Text>
          </View>
        </Touchable>
      );
    },
    [getContactItemTitle, onContactItemClick],
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
