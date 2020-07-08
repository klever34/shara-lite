import React, {memo, useCallback} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {FAButton} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {applyStyles} from '../../../helpers/utils';
import {colors} from '../../../styles';
import Touchable from '../../../components/Touchable';
import {IConversation, IMessage} from '../../../models';
import {useRealm} from '../../../services/realm';
import {useTyping} from '../../../services/pubnub';
import PlaceholderImage from '../../../components/PlaceholderImage';
import MessageStatusIcon from '../../../components/MessageStatusIcon';
import {getAuthService} from '../../../services';

type ChatListItemProps = {
  conversation: IConversation;
};

const ChatListItem = ({conversation}: ChatListItemProps) => {
  const typingMessage = useTyping(conversation.channel);
  const navigation = useNavigation();
  const lastMessage = conversation.lastMessage as IMessage;
  return (
    <Touchable
      onPress={() => {
        navigation.navigate('Chat', conversation);
      }}>
      <View style={listItemStyles.container}>
        <PlaceholderImage text={conversation.title} />
        <View style={listItemStyles.titleContainer}>
          <Text style={listItemStyles.titleText} numberOfLines={1}>
            {conversation.title}
          </Text>
          <View style={applyStyles('flex-row items-center')}>
            {getAuthService().getUser()?.mobile === lastMessage.author && (
              <MessageStatusIcon
                status={lastMessage.timetoken ? 'pending' : 'sent'}
                style={applyStyles('mr-xs')}
              />
            )}
            <Text
              style={applyStyles(
                listItemStyles.contentText,
                typingMessage && {color: 'green'},
              )}
              numberOfLines={1}>
              {typingMessage || lastMessage.content}
            </Text>
          </View>
        </View>
      </View>
    </Touchable>
  );
};

const ChatListScreen = () => {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const conversations = realm
    .objects<IConversation>('Conversation')
    .filtered('lastMessage != null');
  const renderChatListItem = useCallback(
    ({item}: ListRenderItemInfo<IConversation>) => {
      return <ChatListItem conversation={item} />;
    },
    [],
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
    borderBottomColor: colors['gray-400'],
  }),
  imageContainer: applyStyles('center', {
    marginVertical: 12,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    marginRight: 12,
  }),
  titleText: applyStyles('text-lg font-bold mb-sm'),
  contentText: applyStyles('text-base', {color: colors['gray-600']}),
});

export default memo(ChatListScreen);
