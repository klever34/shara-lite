import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {ActivityIndicator, Alert, Text, View} from 'react-native';
import {
  getApiService,
  getAuthService,
  getContactsService,
} from '../../../services';
import {applyStyles} from '../../../helpers/utils';
import Touchable from '../../../components/Touchable';
import {CommonActions, useNavigation} from '@react-navigation/native';
import Share from 'react-native-share';
import AppMenu from '../../../components/Menu';
import Icon from '../../../components/Icon';
import {colors} from '../../../styles';
import {useRealm} from '../../../services/realm';
import {IContact, IConversation} from '../../../models';
import {UpdateMode} from 'realm';
import ContactsList from '../../../components/ContactsList';
import {useErrorHandler} from 'react-error-boundary';

const ContactsScreen = () => {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const contacts = realm.objects<IContact>('Contact').sorted('firstname');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  // TODO: use useAsync hook for tracking loading state
  const handleError = useErrorHandler();
  const loadContacts = useCallback(
    (showLoader = false) => {
      const contactsService = getContactsService();
      if (!contacts.length || showLoader) {
        setLoadingContacts(true);
      }
      contactsService
        .loadContacts()
        .then(() => {
          setLoadingContacts(false);
        })
        .catch((error) => {
          handleError(error);
          setLoadingContacts(false);
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
    },
    [contacts.length, handleError, navigation],
  );
  useEffect(loadContacts, []);
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
    } catch (e) {
      handleError(e);
    }
  }, [handleError]);
  const navigateToChat = useCallback(
    (conversation: IConversation) => {
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
    },
    [navigation],
  );
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={applyStyles('flex-row')}>
          {(loadingContacts || loadingChat) && (
            <ActivityIndicator
              color={colors.white}
              size={24}
              style={applyStyles('mr-md')}
            />
          )}
          <AppMenu
            options={[
              {
                text: 'Refresh',
                onSelect: () => loadContacts(true),
              },
              {
                text: 'Invite a friend',
                onSelect: inviteFriend,
              },
            ]}
          />
        </View>
      ),
    });
  }, [inviteFriend, loadContacts, loadingChat, loadingContacts, navigation]);
  const chatWithContact = useCallback(
    async (item) => {
      if (loadingChat) {
        return;
      }
      try {
        let contact = realm
          .objects<IContact>('Contact')
          .filtered(`mobile = "${item.mobile}"`)[0];
        let channelName = contact.channel;
        let conversation: IConversation;
        const apiService = getApiService();
        if (!channelName) {
          setLoadingChat(true);
          channelName = await apiService.createOneOnOneChannel(item.mobile);
          const authService = getAuthService();
          setLoadingChat(false);
          const user = authService.getUser();
          if (!user) {
            return;
          }
          realm.write(() => {
            conversation = realm.create<IConversation>(
              'Conversation',
              {
                title: item.fullName,
                channel: channelName,
                type: '1-1',
                members: [user.mobile, item.mobile],
              },
              UpdateMode.Modified,
            );
            contact.channel = channelName;
            navigateToChat(conversation);
          });
        } else {
          conversation = realm
            .objects<IConversation>('Conversation')
            .filtered(`channel = "${channelName}"`)[0];
          navigateToChat(conversation);
        }
      } catch (error) {
        setLoadingChat(false);
        handleError(error);
      }
    },
    [loadingChat, navigateToChat, realm, handleError],
  );

  return (
    <ContactsList
      onContactItemClick={chatWithContact}
      ListHeaderComponent={
        <Touchable
          onPress={() => {
            navigation.navigate('SelectGroupMembers');
          }}>
          <View style={applyStyles('flex-row items-center p-md')}>
            <View
              style={applyStyles('mr-md center', {
                height: 48,
                width: 48,
                borderRadius: 24,
                backgroundColor: colors.primary,
              })}>
              <Icon
                type="material-icons"
                name="people"
                color={colors.white}
                size={28}
              />
            </View>
            <Text
              style={applyStyles('text-lg', 'text-400', {
                color: colors['gray-300'],
              })}>
              New group
            </Text>
          </View>
        </Touchable>
      }
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
                color={colors['gray-50']}
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
