import Pubnub, {PubnubStatus} from 'pubnub';
import {usePubNub} from 'pubnub-react';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
//TODO: Potential reduce bundle size by removing unused font set from app
import Icon from 'react-native-vector-icons/MaterialIcons';
import {BaseButton, baseButtonStyles} from '../../components';
import {colors} from '../../styles/base';
import {ChatBubble} from './ChatBubble';
import AsyncStorage from '@react-native-community/async-storage';

type User = {
  id: number;
  email?: string;
  firstname?: string;
  lastname?: string;
  mobile?: string;
};

export type Message = {
  id: string;
  content: string;
  timetoken: number;
  author: MessageAuthor;
};

type MessageAuthor = Pick<User, 'firstname' | 'lastname' | 'mobile'>;

type MessageItemProps = {
  item: Message;
};

const messageItemKeyExtractor = (message: Message) => message.timetoken;

const sortMessagesFunc = (a: Message, b: Message) => {
  var dateA = a.timetoken && new Date(a.timetoken / 10000000).getTime();
  var dateB = b.timetoken && new Date(b.timetoken / 10000000).getTime();
  return dateB - dateA;
};

export const Chat = () => {
  const pubnub = usePubNub();
  const chatListRef = React.useRef<any>(null);
  const [input, setInput] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (pubnub) {
      fetchHistory();
      const listener = {
        message: (envelope: any) => {
          setMessages((msgs) => [
            ...msgs,
            {
              id: envelope.message.id,
              timetoken: envelope.timetoken,
              author: envelope.message.user,
              content: envelope.message.content,
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

  const renderMessageItem = ({item: message}: MessageItemProps) => {
    return (
      <ChatBubble
        message={message}
        isAuthor={message.author?.mobile === pubnub.getUUID()}
      />
    );
  };

  const fetchHistory = () => {
    pubnub.history({channel: 'shara_chat', count: 20}, (status, response) => {
      if (response) {
        const history = response.messages.map((item) => {
          return {
            id: item.entry.id,
            author: item.entry.user,
            timetoken: item.timetoken,
            content: item.entry.content,
          };
        }) as Message[];
        setMessages((messageList) => [...history, ...messageList]);
      }
    });
  };

  const getUser = async () => {
    try {
      const data = await AsyncStorage.getItem('user');
      const parsed = JSON.parse(data);
      setUser(parsed);
    } catch (e) {
      Alert.alert('Error');
    }
  };

  const handleSubmit = () => {
    setInput('');
    const message = {
      content: input,
      id: pubnub.getUUID(),
      user: {
        mobile: user?.mobile,
        lastname: user?.lastname,
        firstname: user?.firstname,
      },
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
        inverted={true}
        ref={chatListRef}
        style={styles.listContainer}
        renderItem={renderMessageItem}
        data={messages.sort(sortMessagesFunc)}
        // onEndReached={() => fetchHistory()}
        keyExtractor={messageItemKeyExtractor}
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
