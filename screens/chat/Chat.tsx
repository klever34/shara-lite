import Pubnub, {PubnubStatus} from 'pubnub';
import {usePubNub} from 'pubnub-react';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
//TODO: Potential reduce bundle size by removing unused font set from app
import Icon from 'react-native-vector-icons/MaterialIcons';
import {BaseButton, baseButtonStyles} from '../../components';
import {colors} from '../../styles/base';
import {ChatBubble} from './ChatBubble';

type Message = {
  id: string;
  author: string;
  content: string;
  timetoken: string | number;
};

type MessageItemProps = {
  item: Message;
};

const messageItemKeyExtractor = (message: Message) => message.timetoken;

export const Chat = () => {
  const pubnub = usePubNub();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const renderMessageItem = ({item: message}: MessageItemProps) => {
    return (
      <ChatBubble
        isAuthor={message.author === pubnub.getUUID()}
        message={message}
      />
    );
  };

  useEffect(() => {
    console.log(pubnub.getUUID());
    if (pubnub) {
      pubnub.history({channel: 'shara_chat', count: 20}, (status, response) => {
        const history = response.messages.map((item) => {
          return {
            id: item.entry.id,
            author: item.entry.id,
            timetoken: item.timetoken,
            content: item.entry.content,
          };
        }) as Message[];
        setMessages(history);
      });
      const listener = {
        message: (envelope: any) => {
          setMessages((msgs) => [
            ...msgs,
            {
              id: envelope.message.id,
              author: envelope.publisher,
              content: envelope.message.content,
              timetoken: envelope.timetoken,
            },
          ]);
        },
      };
      // Add the listener to pubnub instance and subscribe to `chat` channel.
      pubnub.addListener(listener);
      pubnub.subscribe({channels: ['shara_chat']});
      // We need to return a function that will handle unsubscription on unmount
      return () => {
        pubnub.removeListener(listener);
        pubnub.unsubscribeAll();
      };
    }
  }, [pubnub]);

  const handleSubmit = () => {
    setInput('');
    const message = {
      content: input,
      id: pubnub.getUUID(),
    };
    pubnub.publish({channel: 'shara_chat', message}, function (
      status: PubnubStatus,
      response: Pubnub.PublishResponse,
    ) {
      if (status.error) {
        Alert.alert('Error', status.errorData?.message);
      } else {
        console.log('message Published w/ timetoken', response.timetoken);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        // inverted={true}
        data={messages}
        style={styles.listContainer}
        keyExtractor={messageItemKeyExtractor}
        renderItem={renderMessageItem}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
          enablesReturnKeyAutomatically={true}
          placeholder="Type a message"
        />
        {!!input && (
          <BaseButton
            title="Send"
            style={styles.submitButton}
            onPress={handleSubmit}>
            <Icon name="send" style={baseButtonStyles.icon} />
          </BaseButton>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 8,
  },
  messageContainer: {
    marginTop: 8,
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  senderText: {
    fontSize: 14,
    color: '#333',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 36,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 64,
    fontSize: 16,
    lineHeight: 24,
    elevation: 2,
  },
  submitButton: {
    position: 'absolute',
    right: 16,
    borderRadius: 36,
  },
});
