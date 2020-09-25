import React, {useLayoutEffect, useState} from 'react';
import {SafeAreaView, Text, View} from 'react-native';
import {applyStyles} from '@/helpers/utils';
import TextInput from '../../../components/TextInput';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '../index';
import PlaceholderImage from '../../../components/PlaceholderImage';
import {FAButton} from '@/components';
import {ModalWrapperFields} from '@/helpers/hocs';
import HeaderTitle from '../../../components/HeaderTitle';

const SetGroupDetailsScreen = ({
  navigation,
  route,
}: StackScreenProps<MainStackParamList, 'SetGroupDetails'> &
  ModalWrapperFields) => {
  const {participants, title, next} = route.params;
  const [groupName, setGroupName] = useState('');
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle title={title} />,
    });
  });
  return (
    <SafeAreaView style={applyStyles('mx-lg mt-md flex-1')}>
      <TextInput
        placeholder="Type group name here..."
        value={groupName}
        onChangeText={setGroupName}
      />
      <Text style={applyStyles('font-lg mb-md')}>
        Participants: {participants.length}
      </Text>
      <View style={applyStyles('flex-row flex-wrap')}>
        {participants.map((member) => {
          return (
            <View
              style={applyStyles('items-center mx-sm mb-xl')}
              key={member.id}>
              <PlaceholderImage
                text={member.fullName}
                style={applyStyles('mb-sm')}
              />
              <Text>{member.mobile}</Text>
            </View>
          );
        })}
      </View>
      {!!groupName && <FAButton {...next(groupName)} />}
    </SafeAreaView>
  );
};

export default SetGroupDetailsScreen;
