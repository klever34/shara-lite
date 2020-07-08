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
import {applyStyles} from '../../helpers/utils';
import Touchable from '../../components/Touchable';
import {CommonActions, useNavigation} from '@react-navigation/native';
import Share from 'react-native-share';
import AppMenu from '../../components/Menu';
import Icon from '../../components/Icon';
import {colors} from '../../styles';
import {useRealm} from '../../services/realm';
import {IContact, IConversation} from '../../models';
import flatten from 'lodash/flatten';
import {UpdateMode} from 'realm';
import {requester} from '../../services/api/config';
import {IAuthService} from '../../services/AuthService';
import PlaceholderImage from '../../components/PlaceholderImage';

const ContactsScreen = () => {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const contacts = realm.objects<IContact>('Contact').sorted('firstname');
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
        Promise.all(
          Array.from({length: requestNo}).map((_, index) => {
            return requester.post<{users: User[]}>('/users/check', {
              mobiles: numbers.slice(
                sizePerRequest * index,
                sizePerRequest * index + sizePerRequest,
              ),
            });
          }),
        )
          .then((responses: ApiResponse<{users: User[]}>[]) => {
            const users = flatten(responses.map(({data}) => data.users));
            const authService = getAuthService() as IAuthService;
            const me = authService.getUser() as User;
            try {
              realm.write(() => {
                (users as User[]).forEach((user) => {
                  if (me.id !== user.id) {
                    realm.create<IContact>(
                      'Contact',
                      user,
                      UpdateMode.Modified,
                    );
                  }
                });
              });
            } catch (error) {
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
            }
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
            console.log('Error: ', error);
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
            setLoading(true);
            requester
              .post<{
                channelName: string;
              }>('/chat/channel', {
                recipient: item.mobile,
              })
              .then((response) => {
                setLoading(false);
                const {channelName} = response.data;
                let conversation: any = realm
                  .objects<IConversation>('Conversation')
                  .filtered(`channel = "${channelName}"`)[0];
                if (!conversation) {
                  realm.write(() => {
                    conversation = realm.create<IConversation>('Conversation', {
                      title: item.fullName,
                      channel: channelName,
                    });
                  });
                }
                navigation.dispatch(
                  CommonActions.reset({
                    routes: [
                      {name: 'Home'},
                      {
                        name: 'Chat',
                        params: conversation,
                      },
                    ],
                    index: 1,
                  }),
                );
              })
              .catch((error) => {
                setLoading(false);
                console.log('Error: ', error);
              });
          }}>
          <View style={applyStyles('flex-row items-center p-md')}>
            <PlaceholderImage text={item.fullName} />
            <Text style={applyStyles('text-lg', 'font-bold')}>
              {item.fullName}
            </Text>
          </View>
        </Touchable>
      );
    },
    [navigation, realm],
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
              <Text
                style={applyStyles('text-lg', 'text-400', {
                  color: colors['gray-300'],
                })}>
                Invite a friend
              </Text>
            </View>
          </Touchable>
          <Touchable
            onPress={() => {
              const globalChannel = 'SHARA_GLOBAL';
              try {
                let globalConversation: any = realm
                  .objects<IConversation>('Conversation')
                  .filtered(`channel = "${globalChannel}"`)[0];
                if (!globalConversation) {
                  realm.write(() => {
                    globalConversation = realm.create<IConversation>(
                      'Conversation',
                      {
                        channel: globalChannel,
                        title: 'Shara Chat',
                      },
                    );
                  });
                }
                navigation.dispatch(
                  CommonActions.reset({
                    routes: [
                      {name: 'Home'},
                      {name: 'Chat', params: globalConversation},
                    ],
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
              <Text
                style={applyStyles('text-lg', 'text-400', {
                  color: colors['gray-300'],
                })}>
                Shara Chat
              </Text>
            </View>
          </Touchable>
        </>
      }
    />
  );
};

export default ContactsScreen;
