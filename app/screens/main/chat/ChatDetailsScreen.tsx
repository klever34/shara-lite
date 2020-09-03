import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  Text,
  View,
  VirtualizedList,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '..';
import HeaderTitle from '../../../components/HeaderTitle';
import Icon from '../../../components/Icon';
import Touchable from '../../../components/Touchable';
import {applyStyles} from '@/helpers/utils';
import ContactsList from '../../../components/ContactsList';
import {useRealm} from '@/services/realm';
import {IContact} from '@/models';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import TextInput from '../../../components/TextInput';
import {
  getApiService,
  getAuthService,
  getContactService,
  getConversationService,
} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import HeaderRight, {HeaderRightOption} from '@/components/HeaderRight';
import {UpdateMode} from 'realm';
import {ModalPropsList} from 'types/modal';
import {getBaseModelValues} from '@/helpers/models';
import {useScreenRecord} from '@/services/analytics';

const DATA: never[] = [];
const keyExtractor = () => 'key';
const getItem = () => null;
const getItemCount = () => 1;

type EditTextPropertyProps = {
  placeholder: string;
  description?: string;
  initialValue?: string;
  onCancel: () => void;
  onDone: (value: string) => void;
};

const EditTextProperty = ({
  placeholder,
  description = '',
  onCancel,
  onDone,
  initialValue = '',
}: EditTextPropertyProps) => {
  const [value, setValue] = useState(initialValue);
  return (
    <View style={applyStyles('pt-md')}>
      <TextInput
        placeholder={placeholder}
        style={applyStyles('px-lg')}
        value={value}
        onChangeText={setValue}
      />
      {!!description && <Text>{description}</Text>}
      <View style={applyStyles('flex-row w-full')}>
        <Touchable onPress={onCancel}>
          <View
            style={applyStyles('border-1 border-gray-50 flex-1 center py-lg')}>
            <Text style={applyStyles('text-gray-200')}>Cancel</Text>
          </View>
        </Touchable>
        <Touchable
          onPress={() => {
            onDone(value);
            onCancel();
          }}>
          <View
            style={applyStyles(
              'border-1 border-gray-50 text-gray-50 flex-1 center py-lg',
            )}>
            <Text style={applyStyles('text-gray-200')}>OK</Text>
          </View>
        </Touchable>
      </View>
    </View>
  );
};

const ChatDetailsScreen = ({
  navigation,
  route,
  openModal,
}: StackScreenProps<MainStackParamList, 'ChatDetails'> &
  ModalWrapperFields) => {
  useScreenRecord();
  const realm = useRealm();
  const conversation = route.params;
  const participants = realm
    .objects<IContact>('Contact')
    .filtered(`groups CONTAINS "${conversation.channel}"`)
    .sorted([
      ['isMe', true],
      ['firstname', false],
    ]);
  const handleError = useErrorHandler();
  const isCreator = useMemo(() => {
    const me = getAuthService().getUser();
    return conversation.creator === String(me?.mobile);
  }, [conversation.creator]);

  const editTextProperty = useCallback(
    async (property: 'name' | 'description', value: string) => {
      const apiService = getApiService();
      try {
        if (!conversation.id) {
          return;
        }
        const groupChat = await apiService.updateGroupChat(conversation.id, {
          [property]: value,
        });
        realm.write(() => {
          const existingChannel = getConversationService().getConversationByChannel(
            conversation.channel,
          );
          const updatePayload = existingChannel || getBaseModelValues();
          realm.create(
            'Conversation',
            {
              ...updatePayload,
              channel: conversation.channel,
              [property]: groupChat[property],
            },
            UpdateMode.Modified,
          );
        });
      } catch (e) {
        handleError(e);
      }
    },
    [conversation.channel, conversation.id, handleError, realm],
  );

  useLayoutEffect(() => {
    const options: HeaderRightOption[] = [];
    if (conversation.type === 'group') {
      if (isCreator) {
        options.push(
          {
            icon: 'create',
            onPress: () => {
              openModal('bottom-half', {
                renderContent: ({closeModal}) => {
                  return (
                    <EditTextProperty
                      placeholder="Edit group name"
                      initialValue={conversation.name}
                      onDone={(name) => editTextProperty('name', name)}
                      onCancel={closeModal}
                    />
                  );
                },
              });
            },
          },
          {
            icon: 'person-add',
            onPress: () => {
              navigation.navigate('SelectGroupMembers', {
                participants,
                title: 'Add participants',
                next: (selectedContacts: IContact[]) => ({
                  iconName: Platform.select({
                    android: 'md-checkmark',
                    ios: 'ios-checkmark',
                  }),
                  onPress: () => {
                    navigation.goBack();
                    if (!conversation.id) {
                      return;
                    }
                    const closeModal = openModal('loading', {
                      text: 'Adding participants',
                    });
                    const apiService = getApiService();
                    apiService
                      .addGroupChatMembers(conversation.id, selectedContacts)
                      .then((groupChatMembers) => {
                        try {
                          realm.write(() => {
                            conversation.members.push(
                              ...groupChatMembers.map((member) => {
                                const contact = realm
                                  .objects<IContact>('Contact')
                                  .filtered(`id = "${member.user_id}"`)[0];
                                return contact.mobile;
                              }),
                            );
                            for (
                              let i = 0;
                              i < selectedContacts.length;
                              i += 1
                            ) {
                              const contact = selectedContacts[i];
                              getContactService()
                                .updateContact({
                                  _id: contact._id,
                                  groups:
                                    contact.groups + ',' + conversation.channel,
                                })
                                .catch(handleError);
                            }
                          });
                        } catch (e) {
                          handleError(e);
                        }
                      })
                      .catch(handleError)
                      .finally(closeModal);
                  },
                }),
              });
            },
          },
        );
      }
    }
    navigation.setOptions({
      headerTitle: () => {
        return (
          <HeaderTitle
            title={conversation.name}
            // Offset the icons to the right
            style={applyStyles('mr-xl')}
          />
        );
      },
      headerRight: () => <HeaderRight options={options} />,
    });
  }, [
    conversation.channel,
    conversation.id,
    conversation.members,
    conversation.name,
    conversation.type,
    editTextProperty,
    handleError,
    isCreator,
    navigation,
    openModal,
    participants,
    realm,
  ]);

  const removeGroupChatMember = useCallback(
    (contact: IContact) => {
      realm.write(() => {
        conversation.members = conversation.members.filter(
          (member) => member !== contact.mobile,
        );
        getContactService()
          .updateContact({
            _id: contact._id,
            groups: contact.groups
              .split(',')
              .filter((channel) => channel !== conversation.channel)
              .join(','),
          })
          .catch(handleError);
      });
    },
    [conversation.channel, conversation.members, handleError, realm],
  );

  const admins = (conversation?.admins ?? []).reduce<{[key: string]: boolean}>(
    (acc, curr) => {
      return {
        ...acc,
        [curr]: true,
      };
    },
    {},
  );

  const isAdmin = useCallback(
    (contact: IContact) => {
      return admins[contact.mobile];
    },
    [admins],
  );

  const onParticipantClick = useCallback(
    (contact: IContact) => {
      const selectParticipantOptions: ModalPropsList['options']['options'] = [];
      if (conversation.type === 'group') {
        if (isCreator) {
          if (!isAdmin(contact)) {
            selectParticipantOptions.push({
              text: 'Make group admin',
              onPress: async () => {
                closeOptionsModal();
                const closeModal = openModal('loading', {
                  text: 'Adding...',
                });
                try {
                  const apiService = getApiService();
                  await apiService.setGroupAdmin(conversation.id, contact.id);
                  realm.write(() => {
                    conversation.admins?.push(contact.mobile);
                  });
                } catch (e) {
                  handleError(e);
                } finally {
                  closeModal();
                }
              },
            });
          } else {
            selectParticipantOptions.push({
              text: 'Remove group admin',
              onPress: async () => {
                closeOptionsModal();
                const closeModal = openModal('loading', {
                  text: 'Removing...',
                });
                try {
                  const apiService = getApiService();
                  await apiService.setGroupAdmin(
                    conversation.id,
                    contact.id,
                    false,
                  );
                  realm.write(() => {
                    conversation.admins = conversation.admins?.filter(
                      (mobile) => mobile !== contact.mobile,
                    );
                  });
                } catch (e) {
                  handleError(e);
                } finally {
                  closeModal();
                }
              },
            });
          }
          selectParticipantOptions.push({
            text: `Remove ${contact.fullName}`,
            onPress: () => {
              closeOptionsModal();
              Alert.alert(
                '',
                `Remove ${contact.fullName} from "${conversation.name}"?`,
                [
                  {text: 'Cancel'},
                  {
                    text: 'OK',
                    onPress: async () => {
                      const closeModal = openModal('loading', {
                        text: 'Removing...',
                      });
                      try {
                        const apiService = getApiService();
                        await apiService.removeGroupChatMember(
                          conversation.id,
                          contact.id,
                        );
                        removeGroupChatMember(contact);
                      } catch (e) {
                        handleError(e);
                      } finally {
                        closeModal();
                      }
                    },
                  },
                ],
              );
            },
          });
        }
      }
      const closeOptionsModal = openModal('options', {
        options: selectParticipantOptions,
      });
    },
    [
      conversation.admins,
      conversation.id,
      conversation.name,
      conversation.type,
      handleError,
      isAdmin,
      isCreator,
      openModal,
      realm,
      removeGroupChatMember,
    ],
  );

  const renderView = useCallback(() => {
    return (
      <View>
        {conversation.type === 'group' &&
          (conversation.description || isCreator) && (
            <Touchable
              onPress={
                isCreator
                  ? () => {
                      openModal('bottom-half', {
                        renderContent: ({closeModal}) => {
                          return (
                            <EditTextProperty
                              placeholder="Add group description"
                              initialValue={conversation.description}
                              onDone={(description) =>
                                editTextProperty('description', description)
                              }
                              onCancel={closeModal}
                            />
                          );
                        },
                      });
                    }
                  : undefined
              }>
              <View style={applyStyles('p-lg bg-white elevation-1 mb-md')}>
                {conversation.description ? (
                  <>
                    <Text style={applyStyles('text-base mb-xs')}>
                      Group description
                    </Text>
                    <Text style={applyStyles('text-sm')}>
                      {conversation.description}
                    </Text>
                  </>
                ) : (
                  <Text style={applyStyles('text-base')}>
                    Add group description
                  </Text>
                )}
              </View>
            </Touchable>
          )}
        {conversation.type === 'group' && (
          <View style={applyStyles('pt-lg bg-white elevation-1 mb-md')}>
            <Text style={applyStyles('mx-lg text-base font-semibold mb-sm')}>
              {conversation.members.length} participants
            </Text>
            <ContactsList
              contacts={participants}
              getContactItemRight={(contact) =>
                isAdmin(contact) ? (
                  <Text
                    style={applyStyles(
                      'border-1 border-green rounded-4 py-2 px-6 text-green',
                    )}>
                    Group Admin
                  </Text>
                ) : null
              }
              shouldClickContactItem={(item) => !item.isMe}
              getContactItemTitle={(item) => {
                if (item.isMe) {
                  return 'You';
                }
                return item.fullName;
              }}
              onContactItemClick={onParticipantClick}
            />
          </View>
        )}
        {conversation.type === 'group' && (
          <Touchable
            onPress={() => {
              Alert.alert('', `Exit "${conversation.name}" group?`, [
                {text: 'Cancel'},
                {
                  text: 'Exit',
                  onPress: async () => {
                    const closeModal = openModal('loading', {
                      text: 'Removing...',
                    });
                    try {
                      const apiService = getApiService();
                      const me = getAuthService().getUser();
                      if (!me) {
                        return;
                      }
                      await apiService.leaveGroupChat(conversation.id, me.id);
                      const myContact = participants.filtered(
                        `mobile = "${me.mobile}"`,
                      )[0];
                      removeGroupChatMember(myContact);
                    } catch (e) {
                      handleError(e);
                    } finally {
                      closeModal();
                    }
                  },
                },
              ]);
            }}>
            <View
              style={applyStyles(
                'p-sm bg-white elevation-1 mb-md flex-row items-center',
              )}>
              <View
                style={applyStyles('center mx-xs mr-md w-48 h-48 rounded-24')}>
                <Icon
                  type="ionicons"
                  style={applyStyles('text-primary')}
                  size={28}
                  name="md-exit"
                />
              </View>
              <Text style={applyStyles('text-lg font-semibold text-primary')}>
                Exit group
              </Text>
            </View>
          </Touchable>
        )}
      </View>
    );
  }, [
    conversation.description,
    conversation.id,
    conversation.members.length,
    conversation.name,
    conversation.type,
    editTextProperty,
    handleError,
    isAdmin,
    isCreator,
    onParticipantClick,
    openModal,
    participants,
    removeGroupChatMember,
  ]);
  return (
    <SafeAreaView>
      <VirtualizedList
        data={DATA}
        renderItem={renderView}
        keyExtractor={keyExtractor}
        getItemCount={getItemCount}
        getItem={getItem}
      />
    </SafeAreaView>
  );
};

export default withModal(ChatDetailsScreen);
