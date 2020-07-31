import React, {useLayoutEffect} from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '..';
import HeaderTitle from '../../../components/HeaderTitle';
import Icon from '../../../components/Icon';
import Touchable from '../../../components/Touchable';
import {applyStyles} from '../../../helpers/utils';
import ContactsList from '../../../components/ContactsList';

const ChatDetailsScreen = ({
  navigation,
  route,
}: StackScreenProps<MainStackParamList, 'ChatDetails'>) => {
  const conversation = route.params;
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
                console.log('Edit Group Name');
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
  }, [conversation.title, navigation]);
  return (
    <SafeAreaView>
      <ScrollView>
        <View style={applyStyles('p-lg bg-white elevation-1 mb-md')}>
          <Text style={applyStyles('text-md')}>Add group description</Text>
        </View>
        <View style={applyStyles('pt-lg bg-white elevation-1 mb-md')}>
          <Text style={applyStyles('mx-lg text-md font-semibold mb-2')}>
            {conversation.members.length} participants
          </Text>
          <ContactsList
            onContactItemClick={(contact) => {
              console.log(contact.mobile);
            }}
          />
        </View>
        <View
          style={applyStyles(
            'p-sm bg-white elevation-1 mb-md flex-row items-center',
          )}>
          <View
            style={applyStyles('center mx-sm', {
              height: 48,
              width: 48,
              borderRadius: 24,
            })}>
            <Icon
              type="ionicons"
              style={applyStyles('text-gray-200')}
              size={28}
              name="md-exit-outline"
            />
          </View>
          <Text style={applyStyles('text-lg font-semibold')}>Exit group</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatDetailsScreen;
