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
  contacts?: Collection<IContact>;
  getContactItemTitle?: (item: IContact) => string;
  getContactItemDescription?: (item: IContact) => string;
  shouldClickContactItem?: (item: IContact) => boolean;
  onContactItemClick: (item: IContact) => void;
};

const ContactsList = ({
  contacts,
  getContactItemTitle = (item: IContact) => item.fullName,
  getContactItemDescription = () => '',
  shouldClickContactItem = () => true,
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
      const title = getContactItemTitle(item);
      const description = getContactItemDescription(item);
      const itemClickable = shouldClickContactItem(item);
      return (
        <Touchable
          onPress={
            itemClickable
              ? () => {
                  onContactItemClick(item);
                }
              : undefined
          }>
          <View style={applyStyles('flex-row items-center px-md')}>
            <PlaceholderImage
              text={item.fullName}
              style={applyStyles('mr-md my-md')}
            />
            <View>
              <Text
                style={applyStyles(
                  'text-lg mb-xs',
                  !itemClickable && 'text-gray-100',
                )}>
                {title}
              </Text>
              {!!description && (
                <Text style={applyStyles('text-base')}>{description}</Text>
              )}
            </View>
          </View>
        </Touchable>
      );
    },
    [
      getContactItemDescription,
      getContactItemTitle,
      onContactItemClick,
      shouldClickContactItem,
    ],
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
