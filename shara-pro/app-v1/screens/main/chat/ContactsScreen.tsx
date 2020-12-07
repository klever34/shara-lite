import React, {useCallback, useLayoutEffect, useState} from 'react';
import {Alert, Platform, Text, ToastAndroid, View} from 'react-native';
import {
  getAnalyticsService,
  getApiService,
  getAuthService,
  getContactService,
} from '../../../services';
import {applyStyles, generateUniqueId} from 'app-v1/helpers/utils';
import Touchable from '../../../components/Touchable';
import {CommonActions} from '@react-navigation/native';
import Share from 'react-native-share';
import Icon from '../../../components/Icon';
import {colors} from 'app-v1/styles';
import {useRealm} from 'app-v1/services/realm';
import {IConversation, IContact} from 'app-v1/models';
import {UpdateMode} from 'realm';
import ContactsList from '../../../components/ContactsList';
import {useErrorHandler} from 'app-v1/services/error-boundary';
import HeaderRight from '../../../components/HeaderRight';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '../index';
import {ModalWrapperFields, withModal} from 'app-v1/helpers/hocs';
import {getBaseModelValues} from 'app-v1/helpers/models';

const ContactsScreen = ({
  navigation,
  openModal,
}: StackScreenProps<MainStackParamList, 'Contacts'> & ModalWrapperFields) => {
  const realm = useRealm() as Realm;
  const me = getAuthService().getUser();
  const contacts = realm.objects<IContact>('Contact').sorted('firstname');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  // TODO: use useAsync hook for tracking loading state
  const handleError = useErrorHandler();
  const loadContacts = useCallback(
    (showLoader = false) => {
      const contactsService = getContactService();
      if (!contacts.length || showLoader) {
        setLoadingContacts(true);
      }
      contactsService
        .syncPhoneContacts()
        .then(() => {
          setLoadingContacts(false);
          ToastAndroid.show(
            'Your contact list has been updated',
            ToastAndroid.SHORT,
          );
        })
        .catch((error: any) => {
          handleError(error);
          setLoadingContacts(false);
          Alert.alert(
            'Error',
            error.message,
            [
              {
                text: 'OK',
              },
            ],
            {
              cancelable: false,
            },
          );
        });
    },
    [contacts.length, handleError],
  );
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
        <HeaderRight
          loading={loadingContacts || loadingChat}
          menuOptions={[
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
          setLoadingChat(false);
          if (!me) {
            return;
          }

          const conversationData = {
            id: generateUniqueId(),
            name: item.fullName,
            channel: channelName,
            type: '1-1',
            members: [me.mobile, item.mobile],
            ...getBaseModelValues(),
          };
          realm.write(() => {
            //@ts-ignore
            conversation = realm.create(
              // @ts-ignore
              'Conversation',
              conversationData,
              UpdateMode.Modified,
            );
            contact.channel = channelName;
            navigateToChat(conversation);
          });
        } else {
          conversation = realm
            .objects<IConversation>('Conversation')
            .filtered(`channel = "${channelName}"`)[0];
          getAnalyticsService()
            .logEvent('oneOnOneChatInitiated')
            .catch(handleError);
          navigateToChat(conversation);
        }
      } catch (error) {
        setLoadingChat(false);
        handleError(error);
      }
    },
    [loadingChat, realm, me, navigateToChat, handleError],
  );

  return (
    <ContactsList
      onContactItemClick={chatWithContact}
      ListHeaderComponent={
        <Touchable
          onPress={() => {
            const title = 'New Group';
            navigation.navigate('SelectGroupMembers', {
              title,
              next: (participants: IContact[]) => ({
                iconName: Platform.select({
                  android: 'md-arrow-forward',
                  ios: 'ios-arrow-forward',
                }),
                onPress: () => {
                  navigation.navigate('SetGroupDetails', {
                    participants,
                    title,
                    next: (groupName: string) => {
                      return {
                        iconName: Platform.select({
                          android: 'md-checkmark',
                          ios: 'ios-checkmark',
                        }),
                        onPress: () => {
                          const closeModal = openModal('loading', {
                            text: 'Creating Group...',
                          });
                          const apiService = getApiService();
                          apiService
                            .createGroupChat(groupName, participants)
                            .then((groupChat: any) => {
                              try {
                                const groupChatData = {
                                  id: String(groupChat.id),
                                  name: groupChat.name,
                                  type: 'group',
                                  channel: groupChat.uuid,
                                  creator: me?.mobile,
                                  admins: [me?.mobile],
                                  members: [
                                    me?.mobile,
                                    ...participants.map(
                                      (member) => member.mobile,
                                    ),
                                  ],
                                  ...getBaseModelValues(),
                                };
                                realm.write(() => {
                                  const conversation = realm.create(
                                    'Conversation',
                                    groupChatData,
                                    UpdateMode.Modified,
                                  );
                                  getAnalyticsService()
                                    .logEvent('groupChatCreated')
                                    .catch(handleError);
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
                                });
                              } catch (e) {
                                handleError(e);
                              }
                            })
                            .finally(closeModal);
                        },
                      };
                    },
                  });
                },
              }),
            });
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

export default withModal(ContactsScreen);
