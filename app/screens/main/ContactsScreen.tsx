import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  ListRenderItemInfo,
  Text,
  View,
} from 'react-native';
import {getContactsService} from '../../services';
import {Contact} from 'react-native-contacts';
import {applyStyles} from '../../helpers/utils';
import Touchable from '../../components/Touchable';
import {useNavigation} from '@react-navigation/native';
import Share from 'react-native-share';
import AppMenu from '../../components/Menu';
import Icon from '../../components/Icon';
import {colors} from '../../styles';

const ContactsScreen = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const navigation = useNavigation();
  useEffect(() => {
    const contactsService = getContactsService();
    contactsService
      .getAll()
      .then((nextContacts) => {
        setContacts(nextContacts);
      })
      .catch((error) => {
        Alert.alert(
          'Error',
          error.message,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
          {
            cancelable: false,
          },
        );
      });
  }, [navigation]);
  const inviteFriend = useCallback(async () => {
    // TODO: use better copy for shara invite
    const title = 'Share via';
    const message = "Let's chat on Shara.";
    const url = 'https://shara.co/';
    try {
      await Share.open({
        title,
        subject: title,
        message: `${message} ${url}`,
      });
    } catch (e) {}
  }, []);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AppMenu
          options={[
            {
              text: 'Invite a friend',
              onSelect: inviteFriend,
            },
          ]}
        />
      ),
    });
  }, [inviteFriend, navigation]);
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
  return (
    <FlatList
      data={contacts}
      renderItem={renderContactItem}
      keyExtractor={(item: Contact) => item.recordID}
      ListFooterComponent={
        <Touchable onPress={inviteFriend}>
          <View style={applyStyles('flex-row items-center p-md')}>
            <View
              style={applyStyles('mr-md center', {
                height: 48,
                width: 48,
                borderRadius: 24,
              })}>
              <Icon
                type="material-icons"
                name="share"
                color={colors['gray-600']}
                size={28}
              />
            </View>
            <Text style={applyStyles('text-lg')}>Invite a friend</Text>
          </View>
        </Touchable>
      }
    />
  );
};

export default ContactsScreen;
