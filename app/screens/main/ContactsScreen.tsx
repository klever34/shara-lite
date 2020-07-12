import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItemInfo,
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
import {useRealm} from '../../services/RealmService';
import {IContact, IConversation} from '../../models';
import {UpdateMode} from 'realm';
import {requester} from '../../services/ApiService';
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
      .loadContacts()
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
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
      const chatWithContact = async () => {
        try {
          let contact = realm
            .objects<IContact>('Contact')
            .filtered(`mobile = "${item.mobile}"`)[0];
          let channelName = contact.channel;
          let conversation: IConversation;
          if (!channelName) {
            setLoading(true);
            const response = await requester.post<{
              channelName: string;
            }>('/chat/channel', {
              recipient: item.mobile,
            });
            ({channelName} = response.data);
            const authService = getAuthService();
            const user = authService.getUser() as User;
            realm.write(() => {
              conversation = realm.create<IConversation>(
                'Conversation',
                {
                  title: item.fullName,
                  channel: channelName,
                  type: '1-1',
                  members: [user.mobile, item.mobile],
                },
                UpdateMode.Never,
              );
              contact.channel = channelName;
            });
            setLoading(false);
          } else {
            conversation = realm
              .objects<IConversation>('Conversation')
              .filtered(`channel = "${channelName}"`)[0];
          }
          navigation.dispatch(
            CommonActions.reset({
              routes: [
                {name: 'Home'},
                {
                  name: 'Chat',
                  // @ts-ignore
                  params: conversation,
                },
              ],
              index: 1,
            }),
          );
        } catch (error) {
          setLoading(false);
          console.log('Error: ', error);
        }
      };
      return (
        <Touchable onPress={chatWithContact}>
          <View style={applyStyles('flex-row items-center px-md')}>
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
      }
    />
  );
};

export default ContactsScreen;
