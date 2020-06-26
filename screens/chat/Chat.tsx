import Button, {buttonStyles} from '../../components/Button';
import {usePubNub} from 'pubnub-react';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {getUUID} from '../../helpers/utils';
import {colors} from '../../styles/base';
//TODO: Potential reduce bundle size by removing unused font set from app
import Icon from 'react-native-vector-icons/MaterialIcons';

type Message = {
  id: string;
  author: string;
  content: string;
  timetoken: string;
};

type MessageItemProps = {
  item: Message;
};

const messageItemKeyExtractor = (message: Message) => message.timetoken;

const renderMessageItem = ({item: message}: MessageItemProps) => {
  return (
    <View key={message.timetoken} style={styles.messageContainer}>
      <Text style={styles.senderText}>{message.author[0]}</Text>
      <Text style={styles.messageText}>{message.content}</Text>
    </View>
  );
};

export const Chat = () => {
  const pubnub = usePubNub();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (pubnub) {
      pubnub.setUUID('helloTiolu');
      const listener = {
        message: (envelope: any) => {
          setMessages((msgs) => [
            {
              id: envelope.message.id,
              author: envelope.publisher,
              content: envelope.message.content,
              timetoken: envelope.timetoken,
            },
            ...msgs,
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
    // Clear the input field.
    setInput('');
    // Create the message with random `id`.
    const message = {
      content: input,
      id: getUUID(),
    };
    // Publish our message to the channel `chat`
    pubnub.publish({channel: 'shara_chat', message}, function (
      status: any,
      response: any,
    ) {
      if (status.error) {
        // handle error
        console.log(status);
      } else {
        console.log('message Published w/ timetoken', response.timetoken);
      }
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        inverted={true}
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
          <Button
            title="Send"
            style={styles.submitButton}
            onPress={handleSubmit}>
            <Icon name="send" style={buttonStyles.icon} />
          </Button>
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
    right: 20,
  },
});
