import React from 'react';
import fromUnixTime from 'date-fns/fromUnixTime';
import format from 'date-fns/format';
import {StyleSheet, Text, View, StyleProp, TextStyle} from 'react-native';
import {colors} from '../../styles/base';
import {Message} from './Chat';

type Props = {
  message: Message;
  isAuthor: boolean;
};

export const ChatBubble = ({message, isAuthor}: Props) => {
  const {timetoken, author, content} = message;
  const unixTime = fromUnixTime(timetoken / 10000000);
  const messageTime = format(unixTime, 'hh:mma');
  const getDateTextStyle = () => {
    let dateTextStyles = styles.dateText;
    if (isAuthor) {
      return {
        ...dateTextStyles,
        ...{
          textAlign: 'right',
        },
      } as StyleProp<TextStyle>;
    }
    return {
      ...dateTextStyles,
      ...{
        textAlign: 'left',
      },
    } as StyleProp<TextStyle>;
  };

  const getMessageContainerStyle = () => {
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
  };

  const getMessageTextStyle = () => {
    let messageTextStyle = styles.messageText;
    if (isAuthor) {
      return {
        ...messageTextStyle,
      };
    }
    return {
      ...messageTextStyle,
    };
  };

  const getAuthorTextStyle = () => {
    let authorTextStyle = styles.authorText;
    if (isAuthor) {
      return {
        ...authorTextStyle,
      };
    }
    return {
      ...authorTextStyle,
    };
  };

  return (
    <View>
      <View key={message.timetoken} style={getMessageContainerStyle()}>
        {author && (
          <Text style={getAuthorTextStyle()}>
            {author.firstname} {author.lastname}
          </Text>
        )}
        <Text style={getMessageTextStyle()}>{content}</Text>
        <Text style={getDateTextStyle()}>{messageTime}</Text>
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
  },
  dateText: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.5,
    color: colors.black,
  },
});
