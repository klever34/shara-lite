import {usePubNub} from 'pubnub-react';
import React, {useEffect, useState} from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';

type Message = {
  id: string;
  author: string;
  content: string;
  timetoken: string | number;
};

export const Chat = () => {
  const pubnub = usePubNub();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (pubnub) {
      pubnub.history({channel: 'shara_chat', count: 20}, (status, response) => {
        const history = response.messages.map((item) => ({
          id: item.entry.id,
          timetoken: item.timetoken,
          content: item.entry.content,
        })) as Message[];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pubnub]);

  const handleSubmit = () => {
    // Clear the input field.
    setInput('');
    // Create the message with random `id`.
    const message = {
      content: input,
      id: Math.random().toString(16).substr(2),
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
    <SafeAreaView style={styles.outerContainer}>
      <ScrollView>
        <View style={styles.topContainer}>
          {messages.map((message) => (
            <View key={message.timetoken} style={styles.messageContainer}>
              {message.author && (
                <View style={styles.avatar}>
                  <Text style={styles.avatarContent}>{message.author[0]}</Text>
                </View>
              )}
              <View style={styles.messageContent}>
                <Text>{message.content}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
          enablesReturnKeyAutomatically={true}
          placeholder="Type your message here..."
        />
        <View style={styles.submitButton}>
          {input !== '' && <Button title="Send" onPress={handleSubmit} />}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    height: '100%',
  },
  innerContainer: {
    width: '100%',
    height: '100%',
  },
  topContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 50,
    overflow: 'hidden',
    marginRight: 16,
  },
  avatarContent: {
    fontSize: 30,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  messageContent: {
    flex: 1,
  },
  bottomContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 16,
    elevation: 2,
  },
  submitButton: {
    position: 'absolute',
    right: 32,
  },
});
