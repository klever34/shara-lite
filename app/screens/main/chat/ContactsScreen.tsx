import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {Alert, Platform, Text, View} from 'react-native';
import {
  getAnalyticsService,
  getApiService,
  getAuthService,
  getContactsService,
} from '../../../services';
import {applyStyles, generateUniqueId} from '../../../helpers/utils';
import Touchable from '../../../components/Touchable';
import {CommonActions} from '@react-navigation/native';
import Share from 'react-native-share';
import Icon from '../../../components/Icon';
import {colors} from '../../../styles';
import {useRealm} from '../../../services/realm';
import {IConversation} from '../../../models/Conversation';
import {IContact} from '../../../models/Contact';
import {UpdateMode} from 'realm';
import ContactsList from '../../../components/ContactsList';
import {useErrorHandler} from 'react-error-boundary';
import HeaderRight from '../../../components/HeaderRight';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '../index';
import {ModalWrapperFields, withModal} from '../../../helpers/hocs';
import {getBaseModelValues} from '../../../helpers/models';
import {useScreenRecord} from '../../../services/analytics';

const ContactsScreen = ({
  navigation,
  openModal,
}: StackScreenProps<MainStackParamList, 'Contacts'> & ModalWrapperFields) => {
  useScreenRecord();
  const realm = useRealm() as Realm;
  const me = getAuthService().getUser();
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
          realm.write(() => {
            conversation = realm.create<IConversation>(
              'Conversation',
              {
                id: generateUniqueId(),
                name: item.fullName,
                channel: channelName,
                type: '1-1',
                members: [me.mobile, item.mobile],
                ...getBaseModelValues(),
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
                            .then((groupChat) => {
                              try {
                                realm.write(() => {
                                  const conversation = realm.create<
                                    IConversation
                                  >(
                                    'Conversation',
                                    {
                                      id: String(groupChat.id),
                                      name: groupChat.name,
                                      type: 'group',
                                      channel: groupChat.uuid,
                                      admins: [me?.mobile],
                                      members: [
                                        me?.mobile,
                                        ...participants.map(
                                          (member) => member.mobile,
                                        ),
                                      ],
                                      ...getBaseModelValues(),
                                    },
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
