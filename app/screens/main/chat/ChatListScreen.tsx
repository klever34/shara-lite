import React, {memo, useCallback, useMemo} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Realm from 'realm';
import {FAButton} from '@/components';
import {useNavigation} from '@react-navigation/native';
import {applyStyles} from '@/helpers/utils';
import {colors} from '@/styles';
import Touchable from '../../../components/Touchable';
import {IConversation} from '@/models';
import {IMessage} from '@/models';
import {useRealm} from '@/services/realm';
import {useTyping} from '@/services/pubnub';
import PlaceholderImage from '../../../components/PlaceholderImage';
import MessageStatusIcon from '../../../components/MessageStatusIcon';
import {getAuthService} from '@/services';
import {useScreenRecord} from '@/services/analytics';

type ChatListItemProps = {
  conversation: IConversation;
};

const ChatListItem = ({conversation}: ChatListItemProps) => {
  useScreenRecord();
  const typingMessage = useTyping(conversation.channel);
  const navigation = useNavigation();
  const lastMessage = conversation.lastMessage;
  const realm = useRealm();
  const user = getAuthService().getUser();
  const messages = realm
    ? realm
        .objects<IMessage>('Message')
        .filtered(
          `channel = "${conversation.channel}" AND author != "${
            user?.mobile ?? ''
          }" AND delivered_timetoken != null AND read_timetoken = null`,
        )
    : [];
  const dateText = useMemo(() => {
    if (!lastMessage) {
      return '';
    }
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
  }, [lastMessage]);
  return (
    <Touchable
      onPress={() => {
        navigation.navigate('Chat', conversation);
      }}>
      <View style={listItemStyles.container}>
        <PlaceholderImage
          text={conversation.name}
          style={applyStyles('mr-md my-md')}
        />
        <View style={listItemStyles.contentContainer}>
          <View style={listItemStyles.titleContainer}>
            <Text style={listItemStyles.titleText} numberOfLines={1}>
              {conversation.name}
            </Text>
            <Text
              style={applyStyles(
                'text-xs leading-14 text-400 text-gray-200',
                !!messages.length && 'text-primary',
              )}
              numberOfLines={1}>
              {dateText}
            </Text>
          </View>
          <View style={listItemStyles.messageContainer}>
            {lastMessage && (
              <View style={applyStyles('flex-row items-start flex-1')}>
                {!typingMessage && (
                  <MessageStatusIcon
                    message={lastMessage}
                    style={applyStyles('mr-xs mt-2')}
                  />
                )}
                <Text
                  style={applyStyles(
                    listItemStyles.contentText,
                    typingMessage && {color: 'green'},
                    'flex-1',
                  )}
                  numberOfLines={2}>
                  {typingMessage || lastMessage.content}
                </Text>
              </View>
            )}
            {!!messages.length && (
              <View
                style={applyStyles(
                  'center self-center ml-4 w-24 h-20 rounded-10 bg-primary',
                )}>
                <Text
                  style={applyStyles('text-xs leading-14 font-bold', {
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
  const fetchedConversations = realm
    ? realm.objects<IConversation>('Conversation')
    : [];
  const conversations = fetchedConversations.length
    ? realm
        .objects<IConversation>('Conversation')
        .filtered('lastMessage != null OR type = "group"')
        .sorted('lastMessage.created_at', true)
    : [];
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
        iconName="md-text"
        onPress={() => {
          navigation.navigate('Contacts');
        }}
      />
    </View>
  );
};

const listItemStyles = StyleSheet.create({
  container: applyStyles(
    'flex-row items-center mx-md border-b-1 border-b-gray-20',
  ),
  imageContainer: applyStyles(
    'center my-md mr-md w-56 h-56 rounded-28 bg-primary',
  ),
  contentContainer: applyStyles('flex-col flex-1 py-md '),
  titleContainer: applyStyles('flex-row'),
  titleText: applyStyles('flex-1 text-base leading-24 text-500 text-gray-300'),
  messageContainer: applyStyles('flex-row self-start'),
  contentText: applyStyles('text-xs leading-20 text-400 text-gray-200'),
});

export default memo(ChatListScreen);
