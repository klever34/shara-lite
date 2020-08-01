import React, {useCallback, useLayoutEffect, useState} from 'react';
import {Alert, SafeAreaView, Text, View, VirtualizedList} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '..';
import HeaderTitle from '../../../components/HeaderTitle';
import Icon from '../../../components/Icon';
import Touchable from '../../../components/Touchable';
import {applyStyles} from '../../../helpers/utils';
import ContactsList from '../../../components/ContactsList';
import {useRealm} from '../../../services/realm';
import {IContact, IConversation} from '../../../models';
import {ModalWrapperFields, withModal} from '../../../helpers/hocs';
import TextInput from '../../../components/TextInput';
import {getApiService, getAuthService} from '../../../services';
import {useErrorHandler} from 'react-error-boundary';
import HeaderRight, {HeaderRightOption} from '../../../components/HeaderRight';
import {UpdateMode} from 'realm';

const DATA: never[] = [];
const keyExtractor = () => 'key';
const getItem = () => null;
const getItemCount = () => 1;

type EditPropertyProps = {
  placeholder: string;
  description?: string;
  initialValue?: string;
  onCancel: () => void;
  onDone: (value: string) => void;
};

const EditProperty = ({
  placeholder,
  description = '',
  onCancel,
  onDone,
  initialValue = '',
}: EditPropertyProps) => {
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
  const conversation = route.params;
  const realm = useRealm();
  const handleError = useErrorHandler();
  useLayoutEffect(() => {
    const options: HeaderRightOption[] = [];
    if (conversation.type === 'group') {
      const me = getAuthService().getUser();
      if (conversation.creatorId === String(me?.id)) {
        options.push(
          {
            icon: 'create',
            onPress: () => {
              openModal('bottom-half', {
                renderContent: ({closeModal}) => {
                  return (
                    <EditProperty
                      placeholder="Edit group name"
                      initialValue={conversation.name}
                      onDone={async (name) => {
                        const apiService = getApiService();
                        try {
                          if (!conversation.id) {
                            return;
                          }
                          const groupChat = await apiService.updateGroupChat(
                            conversation.id,
                            {
                              name,
                            },
                          );
                          realm.write(() => {
                            realm.create<IConversation>(
                              'Conversation',
                              {
                                channel: conversation.channel,
                                name: groupChat.name,
                              },
                              UpdateMode.Modified,
                            );
                          });
                        } catch (e) {
                          handleError(e);
                        }
                      }}
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
              console.log('Add Participant');
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
    conversation.creatorId,
    conversation.id,
    conversation.name,
    conversation.type,
    handleError,
    navigation,
    openModal,
    realm,
  ]);
  const participants = realm
    .objects<IContact>('Contact')
    .filtered(`groups CONTAINS "${conversation.channel}"`)
    .sorted([
      ['isMe', true],
      ['firstname', false],
    ]);
  const renderView = useCallback(() => {
    return (
      <View>
        <Touchable
          onPress={() => {
            openModal('bottom-half', {
              renderContent: ({closeModal}) => {
                return (
                  <EditProperty
                    placeholder="Add group description"
                    initialValue={conversation.description}
                    onDone={async (description) => {
                      const apiService = getApiService();
                      try {
                        if (!conversation.id) {
                          return;
                        }
                        const response = await apiService.updateGroupChat(
                          conversation.id,
                          {
                            description,
                          },
                        );
                        console.log(response);
                      } catch (e) {
                        handleError(e);
                      }
                    }}
                    onCancel={closeModal}
                  />
                );
              },
            });
          }}>
          <View style={applyStyles('p-lg bg-white elevation-1 mb-md')}>
            <Text style={applyStyles('text-md')}>Add group description</Text>
          </View>
        </Touchable>
        <View style={applyStyles('pt-lg bg-white elevation-1 mb-md')}>
          <Text style={applyStyles('mx-lg text-md font-semibold mb-sm')}>
            {conversation.members.length} participants
          </Text>
          <ContactsList
            contacts={participants}
            getContactItemTitle={(item) => {
              if (item.isMe) {
                return 'You';
              }
              return item.fullName;
            }}
            onContactItemClick={() => {
              openModal('options', {
                options: [
                  {
                    text: 'Make Admin',
                    onPress: () => {},
                  },
                  {
                    text: 'Remove',
                    onPress: () => {},
                  },
                ],
              });
            }}
          />
        </View>
        <Touchable
          onPress={() => {
            Alert.alert('', `Exit "${conversation.name}" group?`, [
              {text: 'Cancel'},
              {text: 'Exit'},
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
                style={applyStyles('text-gray-200')}
                size={28}
                name="md-exit"
              />
            </View>
            <Text style={applyStyles('text-lg font-semibold')}>Exit group</Text>
          </View>
        </Touchable>
      </View>
    );
  }, [
    conversation.description,
    conversation.id,
    conversation.members.length,
    conversation.name,
    handleError,
    openModal,
    participants,
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
