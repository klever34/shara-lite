import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  Text,
  View,
  Alert,
} from 'react-native';
import {getContactsService} from '../../services';
import {Contact} from 'react-native-contacts';
import {applyStyles} from '../../helpers/utils';
import Touchable from '../../components/Touchable';
import {useNavigation} from '@react-navigation/native';

const ContactsScreen = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const navigation = useNavigation();
  const renderContactItem = useCallback(
    ({item}: ListRenderItemInfo<Contact>) => {
      return (
        <Touchable
          onPress={() => {
            Alert.alert(
              'Contact Selected',
              `${item.givenName} ${item.familyName}`,
            );
            navigation.navigate('Home');
          }}>
          <View style={applyStyles('flex-row items-center p-md')}>
            {item.hasThumbnail ? (
              <Image
                source={{uri: item.thumbnailPath}}
                style={applyStyles('mr-md', {
                  height: 48,
                  width: 48,
                  borderRadius: 24,
                })}
              />
            ) : (
              <View
                style={applyStyles('mr-md', {
                  height: 48,
                  width: 48,
                  borderRadius: 24,
                  backgroundColor: '#e3e3e3',
                })}
              />
            )}
            <Text
              style={applyStyles(
                'text-lg',
                'font-bold',
              )}>{`${item.givenName} ${item.familyName}`}</Text>
          </View>
        </Touchable>
      );
    },
    [navigation],
  );
  useEffect(() => {
    const contactsService = getContactsService();
    contactsService.getAll().then((nextContacts) => {
      setContacts(nextContacts);
    });
  }, []);
  return (
    <FlatList
      data={contacts}
      renderItem={renderContactItem}
      keyExtractor={(item: Contact) => item.recordID}
    />
  );
};

export default ContactsScreen;
