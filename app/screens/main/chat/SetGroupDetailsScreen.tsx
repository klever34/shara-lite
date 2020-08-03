import React, {useCallback, useState} from 'react';
import {Platform, SafeAreaView, Text, View} from 'react-native';
import {applyStyles} from '../../../helpers/utils';
import TextInput from '../../../components/TextInput';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '../index';
import PlaceholderImage from '../../../components/PlaceholderImage';
import {FAButton} from '../../../components';
import {getApiService} from '../../../services';
import {IConversation} from '../../../models';
import {useRealm} from '../../../services/realm';
import {UpdateMode} from 'realm';
import {CommonActions} from '@react-navigation/native';
import {ModalWrapperFields, withModal} from '../../../helpers/hocs';
import {useErrorHandler} from 'react-error-boundary';

type SetGroupDetailsScreenProps = StackScreenProps<
  MainStackParamList,
  'SetGroupDetails'
> &
  ModalWrapperFields;

const SetGroupDetailsScreen = ({
  navigation,
  route,
  openModal,
}: SetGroupDetailsScreenProps) => {
  const realm = useRealm();
  const members = route.params.members;
  const [groupName, setGroupName] = useState('');
  const handleError = useErrorHandler();
  const submit = useCallback(() => {
    const closeModal = openModal('loading', {text: 'Creating Group...'});
    const apiService = getApiService();
    apiService
      .createGroupChat(groupName, members)
      .then((groupChat) => {
        try {
          realm.write(() => {
            const conversation = realm.create<IConversation>(
              'Conversation',
              {
                name: groupChat.name,
                type: 'group',
                channel: groupChat.uuid,
                members: members.map((member) => member.mobile),
              },
              UpdateMode.Modified,
            );
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
      .finally(() => {
        closeModal();
      });
  }, [openModal, groupName, members, realm, navigation, handleError]);
  return (
    <SafeAreaView style={applyStyles('mx-lg mt-md flex-1')}>
      <TextInput
        placeholder="Type group name here..."
        value={groupName}
        onChangeText={setGroupName}
      />
      <Text style={applyStyles('font-lg mb-md')}>
        Participants: {members.length}
      </Text>
      <View style={applyStyles('flex-row flex-wrap')}>
        {members.map((member) => {
          return (
            <View style={applyStyles('items-center mr-md')} key={member.id}>
              <PlaceholderImage
                text={member.fullName}
                style={applyStyles('mb-sm')}
              />
              <Text>{member.mobile}</Text>
            </View>
          );
        })}
      </View>
      {!!groupName && (
        <FAButton
          iconName={Platform.select({
            android: 'md-checkmark',
            ios: 'ios-checkmark',
          })}
          onPress={submit}
        />
      )}
    </SafeAreaView>
  );
};

export default withModal(SetGroupDetailsScreen);
