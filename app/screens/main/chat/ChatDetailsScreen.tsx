import React, {useCallback, useLayoutEffect} from 'react';
import {
  Button,
  SafeAreaView,
  Text,
  View,
  VirtualizedList,
  Alert,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '..';
import HeaderTitle from '../../../components/HeaderTitle';
import Icon from '../../../components/Icon';
import Touchable from '../../../components/Touchable';
import {applyStyles} from '../../../helpers/utils';
import ContactsList from '../../../components/ContactsList';
import {useRealm} from '../../../services/realm';
import {IContact} from '../../../models';
import {ModalWrapperFields, withModal} from '../../../helpers/hocs';

const DATA: never[] = [];
const keyExtractor = () => 'key';
const getItem = () => null;
const getItemCount = () => 1;

const ChatDetailsScreen = ({
  navigation,
  route,
  openModal,
}: StackScreenProps<MainStackParamList, 'ChatDetails'> &
  ModalWrapperFields) => {
  const conversation = route.params;
  const realm = useRealm();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        return <HeaderTitle title={conversation.title} />;
      },
      headerRight: () => (
        <View style={applyStyles('flex-row mr-sm')}>
          {[
            {
              icon: 'create',
              onPress: () => {
                openModal('bottom-half', {
                  renderContent: ({closeModal}) => {
                    return (
                      <View>
                        <Button title="Cancel" onPress={closeModal} />
                      </View>
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
          ].map(({icon, onPress}) => (
            <Touchable key={icon} onPress={onPress}>
              <View
                style={applyStyles('center', {
                  height: 48,
                  width: 48,
                  borderRadius: 24,
                })}>
                <Icon
                  type="material-icons"
                  color="white"
                  size={24}
                  name={icon}
                />
              </View>
            </Touchable>
          ))}
        </View>
      ),
    });
  }, [conversation.title, navigation, openModal]);
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
                  <View>
                    <Button title="Cancel" onPress={closeModal} />
                  </View>
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
                  {text: 'Make Admin', onPress: () => {}},
                  {text: 'Remove', onPress: () => {}},
                ],
              });
            }}
          />
        </View>
        <Touchable
          onPress={() => {
            Alert.alert('', `Exit "${conversation.title}" group?`, [
              {text: 'Cancel'},
              {text: 'Exit'},
            ]);
          }}>
          <View
            style={applyStyles(
              'p-sm bg-white elevation-1 mb-md flex-row items-center',
            )}>
            <View
              style={applyStyles('center mx-xs mr-md', {
                height: 48,
                width: 48,
                borderRadius: 24,
              })}>
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
    conversation.members.length,
    conversation.title,
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
