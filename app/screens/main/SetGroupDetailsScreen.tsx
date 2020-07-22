import React, {useCallback, useState} from 'react';
import {ActivityIndicator, SafeAreaView, Text, View} from 'react-native';
import {applyStyles} from '../../helpers/utils';
import TextInput from '../../components/TextInput';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '.';
import PlaceholderImage from '../../components/PlaceholderImage';
import {FAButton} from '../../components';
import Modal from 'react-native-modal';
import {colors} from '../../styles';
import {getApiService} from '../../services';
import {IConversation} from '../../models';
import {useRealm} from '../../services/RealmService';
import {UpdateMode} from 'realm';

const SetGroupDetailsScreen = ({
  navigation,
  route,
}: StackScreenProps<MainStackParamList, 'SetGroupDetails'>) => {
  const realm = useRealm();
  const members = route.params.members;
  const [modalVisible, setModalVisibility] = useState(false);
  const [groupName, setGroupName] = useState('');
  const submit = useCallback(() => {
    setModalVisibility(true);
    const apiService = getApiService();
    apiService
      .createGroupChat(groupName, members)
      .then((groupChat) => {
        try {
          realm.write(() => {
            const conversation = realm.create<IConversation>(
              'Conversation',
              {
                title: groupChat.name,
                type: 'group',
                channel: groupChat.uuid,
                members: members.map((member) => member.mobile),
              },
              UpdateMode.Modified,
            );
            navigation.navigate('Chat', conversation);
          });
        } catch (e) {
          console.log('Error: ', e);
        }
      })
      .finally(() => {
        setModalVisibility(false);
      });
  }, [groupName, members, navigation, realm]);
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
      {!!groupName && <FAButton iconName="checkmark" onPress={submit} />}
      <Modal isVisible={modalVisible} style={applyStyles('items-center')}>
        <View
          style={applyStyles('p-lg flex-row items-center', {
            borderRadius: 4,
            backgroundColor: colors.white,
          })}>
          <ActivityIndicator size={32} style={applyStyles('mr-md')} />
          <Text style={applyStyles('text-lg')}>Creating Group...</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SetGroupDetailsScreen;
