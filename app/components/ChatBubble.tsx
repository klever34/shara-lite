import React, {memo, useMemo} from 'react';
import format from 'date-fns/format';
import {StyleProp, StyleSheet, Text, TextStyle, View} from 'react-native';
import {colors} from '../styles';
import {IContact, IChat, IMessage} from '../models';
import {useRealm} from '../services/realm';
import MessageStatusIcon from './MessageStatusIcon';
import {applyStyles} from '../helpers/utils';
import {getAuthService} from '../services';

type ChatBubbleProps = {
  message: IMessage;
};

export const ChatBubble = memo(({message}: ChatBubbleProps) => {
  const authService = getAuthService();
  const user = authService.getUser();
  const isAuthor = user?.mobile === message.author;
  const {created_at, author, content} = message;
  const realm = useRealm();
  const showSender = useMemo(() => {
    const chat = realm
      .objects<IChat>('Chat')
      .filtered(`channel = "${message.channel}"`)[0];
    return !isAuthor && chat?.type !== '1-1';
  }, [isAuthor, message.channel, realm]);
  let sender = useMemo(() => {
    if (!author) {
      return author;
    }
    const contact = realm
      .objects<IContact>('Contact')
      .filtered(`mobile = "${author}"`)[0];
    if (contact) {
      return contact.fullName;
    } else {
      return author;
    }
  }, [author, realm]);
  const messageTime = useMemo(() => format(new Date(created_at), 'hh:mma'), [
    created_at,
  ]);
  const dateTextStyle = useMemo(() => {
    if (isAuthor) {
      return {
        ...styles.dateText,
      } as StyleProp<TextStyle>;
    }
    return {
      ...styles.dateText,
    } as StyleProp<TextStyle>;
  }, [isAuthor]);

  const messageContainerStyle = useMemo(() => {
    let messageContainerStyles = styles.messageContainer;
    if (isAuthor) {
      return {
        ...messageContainerStyles,
        ...{
          alignSelf: 'flex-end',
          backgroundColor: 'rgba(213,249,186,1)',
        },
      } as StyleProp<TextStyle>;
    }
    return {
      ...messageContainerStyles,
      ...{
        alignSelf: 'flex-start',
        backgroundColor: colors.white,
      },
    } as StyleProp<TextStyle>;
  }, [isAuthor]);

  const messageTextStyle = useMemo(() => {
    if (isAuthor) {
      return {
        ...styles.messageText,
        ...{alignSelf: 'flex-end'},
      } as StyleProp<TextStyle>;
    }
    return {
      ...styles.messageText,
      ...{alignSelf: 'flex-start'},
    } as StyleProp<TextStyle>;
  }, [isAuthor]);

  const authorTextStyle = useMemo(() => {
    if (isAuthor) {
      return {
        ...styles.authorText,
      };
    }
    return {
      ...styles.authorText,
    };
  }, [isAuthor]);

  return (
    <View>
      <View key={message.id} style={messageContainerStyle}>
        {showSender && <Text style={authorTextStyle}>{sender}</Text>}
        <Text style={messageTextStyle}>{content}</Text>
        <View style={styles.dateTextContainer}>
          <Text style={dateTextStyle}>{messageTime}</Text>
          <MessageStatusIcon message={message} style={applyStyles('ml-xs')} />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  messageContainer: {
    marginTop: 8,
    maxWidth: 320,
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 1,
  },
  authorText: {
    fontSize: 12,
    opacity: 0.5,
    fontFamily: 'Rubik-Regular',
    color: colors['gray-900'],
  },
  messageText: {
    fontSize: 17,
    fontFamily: 'Rubik-Regular',
    color: colors['gray-900'],
  },
  dateTextContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.5,
    textAlign: 'right',
    fontFamily: 'Rubik-Regular',
    color: colors.black,
  },
});
