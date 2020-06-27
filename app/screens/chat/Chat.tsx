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
  ActivityIndicator,
  ImageBackground,
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
  const [fetchCount, setFetchCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const count = 20 * fetchCount;
    setIsLoading(true);
    pubnub.history({channel: 'shara_chat', count}, (status, response) => {
      if (response) {
        setIsLoading(false);
        const history = response.messages.map((item) => {
          return {
            id: item.entry.id,
            author: item.entry.user,
            timetoken: item.timetoken,
            content: item.entry.content,
          };
        }) as Message[];
        setMessages(history);
        setFetchCount(fetchCount + 1);
      }
    });
  };

  const getUser = async () => {
    try {
      const data = await AsyncStorage.getItem('user');
      const parsed = data && JSON.parse(data);
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
      {isLoading && (
        <View style={styles.loadingSection}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              animating={isLoading}
              color={colors.primary}
            />
          </View>
        </View>
      )}

      <ImageBackground
        source={require('../../assets/images/chat-wallpaper.jpg')}
        style={styles.chatBackground}>
        <FlatList
          inverted={true}
          ref={chatListRef}
          style={styles.listContainer}
          renderItem={renderMessageItem}
          onEndReached={() => fetchHistory()}
          data={messages.sort(sortMessagesFunc)}
          keyExtractor={messageItemKeyExtractor}
        />
      </ImageBackground>
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
  loadingSection: {
    top: 10,
    zIndex: 100,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  loadingContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  chatBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});
