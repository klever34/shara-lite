import React, {memo, useCallback, useMemo} from 'react';
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
import {useRealm} from '../../../services/RealmService';
import {useTyping} from '../../../services/PubNubService';
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
  const realm = useRealm();
  const user = getAuthService().getUser() as User;
  const messages = realm
    .objects<IMessage>('Message')
    .filtered(
      `channel = "${conversation.channel}" AND author != "${user.mobile}" AND received_timetoken != null AND read_timetoken = null`,
    );
  const dateText = useMemo(() => {
    const createdAtDate = lastMessage.created_at;
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    if (createdAtDate.getTime() >= midnight.getTime()) {
      return createdAtDate
        .toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace(/(:\d{2}| [AP]M)$/, '');
    } else {
      const upperMidnight = new Date();
      upperMidnight.setHours(0, 0, 0, 0);
      upperMidnight.setDate(upperMidnight.getDate() - 1);
      if (createdAtDate.getTime() >= upperMidnight.getTime()) {
        return 'Yesterday';
      } else {
        return createdAtDate.toLocaleDateString();
      }
    }
  }, [lastMessage.created_at]);
  return (
    <Touchable
      onPress={() => {
        navigation.navigate('Chat', conversation);
      }}>
      <View style={listItemStyles.container}>
        <PlaceholderImage
          text={conversation.title}
          style={applyStyles('mr-md my-md')}
        />
        <View style={listItemStyles.contentContainer}>
          <View style={listItemStyles.titleContainer}>
            <Text style={listItemStyles.titleText} numberOfLines={1}>
              {conversation.title}
            </Text>
            <Text style={listItemStyles.dateText} numberOfLines={1}>
              {dateText}
            </Text>
          </View>
          <View style={listItemStyles.messageContainer}>
            <View style={applyStyles('flex-row items-center flex-1')}>
              {!typingMessage && (
                <MessageStatusIcon
                  message={lastMessage}
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
            {!!messages.length && (
              <View
                style={applyStyles('center', {
                  width: 24,
                  height: 24,
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                })}>
                <Text
                  style={applyStyles('text-xs font-bold', {
                    color: colors.white,
                  })}>
                  {messages.length >= 100 ? '99+' : messages.length}
                </Text>
              </View>
            )}
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
    .filtered('lastMessage != null')
    .sorted('lastMessage.created_at', true);
  const renderChatListItem = useCallback(
    ({item}: ListRenderItemInfo<IConversation>) => {
      return <ChatListItem conversation={item} />;
    },
    [],
  );
  return (
    <View style={applyStyles('flex-1', {backgroundColor: colors.white})}>
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
  container: applyStyles('flex-row items-center px-md'),
  imageContainer: applyStyles('center my-md mr-md', {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
  }),
  contentContainer: applyStyles('flex-col flex-1 py-md', {
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-20'],
  }),
  titleContainer: applyStyles('h-full flex-1 flex-row'),
  titleText: applyStyles('flex-1 text-lg font-bold mb-sm'),
  dateText: applyStyles('text-sm', {color: colors['gray-200']}),
  messageContainer: applyStyles('flex-row self-start'),
  contentText: applyStyles('text-base', {color: colors['gray-50']}),
});

export default memo(ChatListScreen);
