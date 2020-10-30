import React, {ReactNode, useCallback} from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItemInfo,
  Text,
  View,
} from 'react-native';
import {useRealm} from 'app-v3/services/realm';
import {IContact} from 'app-v3/models';
import Touchable from './Touchable';
import PlaceholderImage, {PlaceholderImageProps} from './PlaceholderImage';
import {Collection} from 'realm';
import {getAnalyticsService, getAuthService} from 'app-v3/services';
import {useErrorHandler} from 'app-v3/services/error-boundary';
import {applyStyles} from 'app-v3/styles';

type ContactsListProps = Omit<
  FlatListProps<IContact>,
  'data' | 'renderItem' | 'keyExtractor'
> & {
  contacts?: Collection<IContact>;
  getContactItemTitle?: (item: IContact) => string;
  getContactItemDescription?: (item: IContact) => string;
  getContactItemImageProps?: (item: IContact) => Partial<PlaceholderImageProps>;
  shouldClickContactItem?: (item: IContact) => boolean;
  getContactItemRight?: (item: IContact) => ReactNode;
  onContactItemClick: (item: IContact) => void;
};

const ContactsList = ({
  contacts,
  getContactItemTitle = (item: IContact) => item.fullName,
  getContactItemDescription = () => '',
  getContactItemImageProps = () => ({}),
  getContactItemRight = () => null,
  shouldClickContactItem = () => true,
  onContactItemClick,
  ...restProps
}: ContactsListProps) => {
  const realm = useRealm() as Realm;
  contacts =
    contacts ??
    realm
      .objects<IContact>('Contact')
      .filtered(
        `mobile != "${
          getAuthService().getUser()?.mobile ?? ''
        }" && recordId != null`,
      )
      .sorted('firstname');
  const handleError = useErrorHandler();
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
                  getAnalyticsService()
                    .logEvent('selectContent', {
                      item_id: String(item._id),
                      content_type: 'Contact',
                    })
                    .catch(handleError);
                  onContactItemClick(item);
                }
              : undefined
          }>
          <View style={applyStyles('flex-row items-center px-md')}>
            <PlaceholderImage
              {...getContactItemImageProps(item)}
              text={item.fullName}
              style={applyStyles('mr-md my-md')}
            />
            <View style={applyStyles('flex-1')}>
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
            {getContactItemRight(item)}
          </View>
        </Touchable>
      );
    },
    [
      getContactItemDescription,
      getContactItemImageProps,
      getContactItemRight,
      getContactItemTitle,
      handleError,
      onContactItemClick,
      shouldClickContactItem,
    ],
  );
  return (
    <FlatList
      {...restProps}
      data={contacts}
      renderItem={renderContactItem}
      keyExtractor={(item: IContact) => String(item._id)}
    />
  );
};

export default ContactsList;
