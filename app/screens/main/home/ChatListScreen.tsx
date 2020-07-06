import React, {useCallback} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {FAButton} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {applyStyles} from '../../../helpers/utils';
import Icon from '../../../components/Icon';
import {colors} from '../../../styles';
import Touchable from '../../../components/Touchable';
import {IConversation} from '../../../models';
import {useRealm} from '../../../services/realm';

const ChatListScreen = () => {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const conversations = realm.objects<IConversation>('Conversation');
  const renderChatListItem = useCallback(
    ({item}: ListRenderItemInfo<IConversation>) => {
      return (
        <Touchable
          onPress={() => {
            navigation.navigate('Chat', {
              title: item.title,
              channel: item.channel,
            });
          }}>
          <View style={listItemStyles.container}>
            <View style={listItemStyles.imageContainer}>
              <Icon
                type="ionicons"
                name={
                  Platform.select({
                    android: 'md-globe',
                    ios: 'ios-globe',
                  }) as string
                }
                color="white"
                size={24}
              />
            </View>
            <View style={listItemStyles.titleContainer}>
              <Text style={listItemStyles.titleText}>{item.title}</Text>
            </View>
          </View>
        </Touchable>
      );
    },
    [navigation],
  );
  return (
    <View style={applyStyles('flex-1')}>
      <FlatList
        data={conversations}
        renderItem={renderChatListItem}
        keyExtractor={(item) => item.channel}
      />
      <FAButton
        iconName="text"
        onPress={() => {
          navigation.navigate('Contacts');
        }}
      />
    </View>
  );
};

const listItemStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: applyStyles('h-full flex-1', {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  }),
  imageContainer: applyStyles('center', {
    marginVertical: 12,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    marginRight: 12,
  }),
  titleText: applyStyles('text-lg', {fontWeight: 'bold'}),
});

export default ChatListScreen;
