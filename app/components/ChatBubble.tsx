import React, {useMemo} from 'react';
import format from 'date-fns/format';
import {StyleProp, StyleSheet, Text, TextStyle, View} from 'react-native';
import {colors} from '../styles/base';
import {Message} from '../screens/chat';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {usePubNub} from 'pubnub-react';
import {convertTimeTokenToDate} from '../helpers/utils';

type ChatBubbleProps = {
  message: Message;
};

export const ChatBubble = ({message}: ChatBubbleProps) => {
  const pubnub = usePubNub();
  const isAuthor = message.id === pubnub.getUUID();
  const {timetoken, author, content} = message;
  const messageTime = useMemo(() => {
    return format(convertTimeTokenToDate(timetoken ?? 0), 'hh:mma');
  }, [timetoken]);
  const dateTextStyles = useMemo(() => {
    if (isAuthor) {
      return {
        ...styles.dateTextContainer,
      } as StyleProp<TextStyle>;
    }
    return {
      ...styles.dateTextContainer,
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
      };
    }
    return {
      ...styles.messageText,
    };
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
      <View key={message.timetoken} style={messageContainerStyle}>
        {author && !isAuthor && (
          <Text style={authorTextStyle}>
            {author.firstname} {author.lastname}
          </Text>
        )}
        <Text style={messageTextStyle}>{content}</Text>
        <Text style={dateTextStyles}>
          <Text>{messageTime}</Text>
          <MaterialCommunityIcons name="alarm" style={styles.receiptIcon} />
        </Text>
      </View>
    </View>
  );
};

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
    color: colors.gray,
  },
  messageText: {
    fontSize: 17,
    color: colors.gray,
    alignSelf: 'flex-end',
  },
  dateTextContainer: {
    fontSize: 10,
    textAlignVertical: 'center',
    marginTop: 4,
    opacity: 0.5,
    textAlign: 'right',
    color: colors.black,
  },
  receiptIcon: {
    paddingLeft: 8,
  },
});
