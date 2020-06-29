import {MessageEvent, PublishResponse, PubnubStatus, SignalEvent} from 'pubnub';
import AsyncStorage from '@react-native-community/async-storage';
import {usePubNub} from 'pubnub-react';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
  Text,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
//TODO: Potential reduce bundle size by removing unused font set from app
import Icon from 'react-native-vector-icons/MaterialIcons';
import {BaseButton, baseButtonStyles} from '../../components';
import {colors} from '../../styles/base';
import {ChatBubble} from '../../components/ChatBubble';
import StorageService from '../../services/StorageService';
import {generateUniqueId} from '../../helpers/utils';

export type User = {
  id: number;
  email?: string;
  firstname?: string;
  lastname?: string;
  mobile?: string;
};

type MessageAuthor = Pick<User, 'firstname' | 'lastname' | 'mobile' | 'id'>;

export type Message = {
  id: string;
  device: string;
  created_at: number;
  content: string;
  author: MessageAuthor;
  timetoken?: string | number;
};

type MessageItemProps = {
  item: Message;
};

const messageItemKeyExtractor = (message: Message) => message.id;

const sortMessages = (a: Message, b: Message) => {
  const dateA = new Date(a.created_at).getTime();
  const dateB = new Date(b.created_at).getTime();
  return dateB - dateA;
};

export const Chat = ({navigation}: any) => {
  const pubnub = usePubNub();
  const chatMessageChannel = 'SHARA_GLOBAL';
  const isTypingChannel = 'IS_TYPING';
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    StorageService.getItem('user').then((nextUser) => {
      if (nextUser) {
        setUser(nextUser);
      }
    });
  }, []);

  const handleLogout = useCallback(async () => {
    await AsyncStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{name: 'Auth'}],
    });
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        return (
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Shara Chat</Text>
            {!!typingMessage && (
              <Text style={styles.headerTitleDesc}>{typingMessage}</Text>
            )}
          </View>
        );
      },
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <TouchableOpacity>
              <Icon color={colors.white} name="more-vert" size={30} />
            </TouchableOpacity>
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={handleLogout} text="Logout" />
          </MenuOptions>
        </Menu>
      ),
    });
  }, [handleLogout, navigation, typingMessage]);

  const fetchHistory = useCallback(() => {
    const count = messages.length + 20;
    setIsLoading(true);
    pubnub.history({channel: chatMessageChannel, count}, (status, response) => {
      setIsLoading(false);
      if (response) {
        const history: Message[] = response.messages.map((item) => {
          const entry = item.entry as Message;
          return {
            ...entry,
            timetoken: item.timetoken,
          };
        });
        setMessages(history.sort(sortMessages));
      }
    });
  }, [messages.length, pubnub]);

  useEffect(fetchHistory, []);
  useEffect(() => {
    if (pubnub) {
      const listener = {
        message: (envelope: MessageEvent) => {
          const message = envelope.message as Message;
          setMessages((prevMessages) => {
            const prevMessageIndex = prevMessages.findIndex(
              ({id}) => id === message.id,
            );
            const nextMessages: Message[] = [
              ...prevMessages.slice(0, prevMessageIndex),
              {
                ...message,
                timetoken: envelope.timetoken,
              },
              ...prevMessages.slice(prevMessageIndex + 1),
            ];
            return nextMessages.sort(sortMessages);
          });
        },
        signal: (envelope: SignalEvent) => {
          if (
            envelope.message === 'TYPING_ON' &&
            envelope.publisher !== pubnub.getUUID()
          ) {
            setTypingMessage(`${envelope.publisher} is typing...`);
          } else {
            setTypingMessage('');
          }
        },
      };
      // Add the listener to pubnub instance and subscribe to `chat` channel.
      pubnub.addListener(listener);
      pubnub.subscribe({channels: [chatMessageChannel, isTypingChannel]});
      // We need to return a function that will handle unsubscription on unmount
      return () => {
        pubnub.removeListener(listener);
        pubnub.unsubscribeAll();
      };
    }
  }, [pubnub]);

  useEffect(() => {
    if (input && !isTyping) {
      setIsTyping(true);
      pubnub.signal({
        channel: isTypingChannel,
        message: 'TYPING_ON',
      });
    } else if (!input && isTyping) {
      setIsTyping(false);
      pubnub.signal({
        channel: isTypingChannel,
        message: 'TYPING_OFF',
      });
    }
  }, [user, input, isTyping, pubnub]);

  const handleSubmit = useCallback(() => {
    setInput('');
    const message: Message = {
      id: generateUniqueId(),
      content: input,
      created_at: new Date().getTime(),
      device: pubnub.getUUID(),
      author: {
        id: user?.id ?? -1,
        mobile: user?.mobile,
        lastname: user?.lastname,
        firstname: user?.firstname,
      },
    };
    setMessages((prevMessages) => [message, ...prevMessages]);
    pubnub.publish({channel: chatMessageChannel, message}, function (
      status: PubnubStatus,
      response: PublishResponse,
    ) {
      if (status.error) {
        Alert.alert('Error', status.errorData?.message);
      } else {
        console.log('message Published w/ timetoken', response.timetoken);
      }
    });
  }, [input, pubnub, user]);

  const renderMessageItem = useCallback(
    ({item: message}: MessageItemProps) => {
      if (!user) {
        return null;
      }
      return <ChatBubble message={message} user={user} />;
    },
    [user],
  );

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
          style={styles.listContainer}
          renderItem={renderMessageItem}
          onEndReached={fetchHistory}
          data={messages}
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
  headerTitle: {
    flexDirection: 'column',
  },
  headerTitleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 24,
  },
  headerTitleDesc: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
});
