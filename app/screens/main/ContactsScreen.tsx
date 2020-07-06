import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItemInfo,
  Platform,
  Text,
  View,
} from 'react-native';
import {getAuthService, getContactsService} from '../../services';
import {applyStyles, handleFetchErrors} from '../../helpers/utils';
import Touchable from '../../components/Touchable';
import {CommonActions, useNavigation} from '@react-navigation/native';
import Share from 'react-native-share';
import AppMenu from '../../components/Menu';
import Icon from '../../components/Icon';
import {colors} from '../../styles';
import {useRealm} from '../../services/realm';
import {IContact, IConversation} from '../../models';
import Config from 'react-native-config';
import flatten from 'lodash/flatten';
import {UpdateMode} from 'realm';

const ContactsScreen = () => {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const contacts = realm.objects<IContact>('Contact');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const contactsService = getContactsService();
    setLoading(true);
    contactsService
      .getAll()
      .then((nextContacts) => {
        const sizePerRequest = 20;
        const numbers = flatten(
          nextContacts.map((contact) =>
            contact.phoneNumbers.map((phoneNumber) => phoneNumber.number),
          ),
        );
        const requestNo = Math.ceil(numbers.length / sizePerRequest);
        const authService = getAuthService();
        Promise.all(
          Array.from({length: requestNo}).map((_, index) => {
            return fetch(`${Config.API_BASE_URL}/users/check`, {
              method: 'POST',
              headers: {
                credentials: 'include',
                Authorization: `Bearer ${authService.getToken()}` ?? '',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                mobiles: numbers.slice(
                  sizePerRequest * index,
                  sizePerRequest * index + sizePerRequest,
                ),
              }),
            });
          }),
        )
          .then((responses) => Promise.all(responses.map(handleFetchErrors)))
          .then((responses) => {
            const users = flatten(
              (responses as ApiResponse[]).map(({data}) => data.users),
            );
            realm.write(() => {
              users.forEach((user) => {
                realm.create<IContact>('Contact', user, UpdateMode.Modified);
              });
            });
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
            console.log('Error: ', error);
          });
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
  }, [navigation, realm]);
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
        <View style={applyStyles('flex-row')}>
          {loading && (
            <ActivityIndicator
              color={colors.white}
              size={24}
              style={applyStyles('mr-md')}
            />
          )}
          <AppMenu
            options={[
              {
                text: 'Invite a friend',
                onSelect: inviteFriend,
              },
            ]}
          />
        </View>
      ),
    });
  }, [inviteFriend, loading, navigation]);
  const renderContactItem = useCallback(
    ({item}: ListRenderItemInfo<IContact>) => {
      return (
        <Touchable
          onPress={() => {
            Alert.alert('Contact Selected', item.fullName);
            navigation.navigate('Home');
          }}>
          <View style={applyStyles('flex-row items-center p-md')}>
            <View
              style={applyStyles('mr-md', {
                height: 48,
                width: 48,
                borderRadius: 24,
                backgroundColor: '#e3e3e3',
              })}
            />

            <Text style={applyStyles('text-lg', 'font-bold')}>
              {item.fullName}
            </Text>
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
      keyExtractor={(item: IContact) => item.mobile}
      ListFooterComponent={
        <>
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
          <Touchable
            onPress={() => {
              const globalChannel = 'SHARA_GLOBAL';
              try {
                let global: any = realm
                  .objects<IConversation>('Conversation')
                  .find(
                    (conversation) => conversation.channel === globalChannel,
                  );
                if (!global) {
                  realm.write(() => {
                    global = realm.create('Conversation', {
                      channel: globalChannel,
                      title: 'Shara Chat',
                    });
                  });
                }
                navigation.dispatch(
                  CommonActions.reset({
                    routes: [{name: 'Home'}, {name: 'Chat', params: global}],
                    index: 1,
                  }),
                );
              } catch (e) {
                console.log('Error: ', e);
              }
            }}>
            <View style={applyStyles('flex-row items-center p-md')}>
              <View
                style={applyStyles('mr-md center', {
                  height: 48,
                  width: 48,
                  borderRadius: 24,
                })}>
                <Icon
                  type="ionicons"
                  name={
                    Platform.select({
                      android: 'md-globe',
                      ios: 'ios-globe',
                    }) as string
                  }
                  color={colors['gray-600']}
                  size={28}
                />
              </View>
              <Text style={applyStyles('text-lg')}>Shara Chat</Text>
            </View>
          </Touchable>
        </>
      }
    />
  );
};

export default ContactsScreen;
