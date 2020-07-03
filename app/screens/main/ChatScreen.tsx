import {MessageEvent, PublishResponse, PubnubStatus, SignalEvent} from 'pubnub';
import {usePubNub} from 'pubnub-react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import EmojiSelector, {Categories} from 'react-native-emoji-selector';
import Icon from '../../components/Icon';
import {BaseButton, baseButtonStyles} from '../../components';
import {ChatBubble} from '../../components/ChatBubble';
import {generateUniqueId} from '../../helpers/utils';
import {colors} from '../../styles';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from './index';
import {getAuthService} from '../../services';

type MessageItemProps = {
  item: ChatMessage;
};

const messageItemKeyExtractor = (message: ChatMessage) => message.id;

const sortMessages = (a: ChatMessage, b: ChatMessage) => {
  const dateA = new Date(a.created_at).getTime();
  const dateB = new Date(b.created_at).getTime();
  return dateB - dateA;
};

const ChatScreen = ({
  navigation,
  route,
}: StackScreenProps<MainStackParamList, 'Chat'>) => {
  const pubnub = usePubNub();
  const inputRef = useRef<any>(null);
  const chatMessageChannel = 'SHARA_GLOBAL';
  const isTypingChannel = 'IS_TYPING';
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showEmojiBoard, setShowEmojiBoard] = useState(false);
  const user = useMemo<User | null>(() => {
    const authService = getAuthService();
    return authService.getUser();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        return (
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>{route.params.title}</Text>
            {!!typingMessage && (
              <Text style={styles.headerTitleDesc}>{typingMessage}</Text>
            )}
          </View>
        );
      },
    });
  }, [navigation, route.params.title, typingMessage]);

  const fetchHistory = useCallback(() => {
    const count = messages.length + 20;
    setIsLoading(true);
    pubnub.history({channel: chatMessageChannel, count}, (status, response) => {
      setIsLoading(false);
      if (response) {
        const history: ChatMessage[] = response.messages.map((item) => {
          const entry = item.entry as ChatMessage;
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
          const message = envelope.message as ChatMessage;
          setMessages((prevMessages) => {
            const prevMessageIndex = prevMessages.findIndex(
              ({id}) => id === message.id,
            );
            let nextMessages: ChatMessage[];
            if (prevMessageIndex > -1) {
              nextMessages = [
                ...prevMessages.slice(0, prevMessageIndex),
                {
                  ...message,
                  timetoken: envelope.timetoken,
                },
                ...prevMessages.slice(prevMessageIndex + 1),
              ];
            } else {
              nextMessages = [
                {
                  ...message,
                  timetoken: envelope.timetoken,
                },
                ...prevMessages,
              ];
            }
            return nextMessages.sort(sortMessages);
          });
        },
        signal: (envelope: SignalEvent) => {
          if (
            envelope.message === 'TYPING_ON' &&
            envelope.publisher !== pubnub.getUUID()
          ) {
            setTypingMessage(`+${envelope.publisher} is typing...`);
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
    const message: ChatMessage = {
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
    const messagePayload = {
      pn_gcm: {
        notification: {
          title: `${user?.firstname} ${user?.lastname}`,
          body: input,
        },
        data: {
          ...message,
          channel: chatMessageChannel,
        },
      },
      ...message,
    };
    setMessages((prevMessages) => [message, ...prevMessages]);
    pubnub.publish(
      {channel: chatMessageChannel, message: messagePayload},
      function (status: PubnubStatus, response: PublishResponse) {
        if (status.error) {
          Alert.alert('Error', status.errorData?.message);
        } else {
          console.log('message Published w/ timetoken', response.timetoken);
        }
      },
    );
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

  const openEmojiBoard = useCallback(() => {
    setShowEmojiBoard(true);
    Keyboard.dismiss();
  }, []);

  const closeEmojiBoard = useCallback(() => {
    setShowEmojiBoard(false);
    inputRef.current.focus();
  }, []);

  const toggleEmojiBoard = useCallback(() => {
    if (showEmojiBoard) {
      closeEmojiBoard();
    } else {
      openEmojiBoard();
    }
  }, [showEmojiBoard, closeEmojiBoard, openEmojiBoard]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/chat-wallpaper.png')}
        style={styles.chatBackground}>
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

        <FlatList
          inverted={true}
          style={styles.listContainer}
          renderItem={renderMessageItem}
          onEndReached={fetchHistory}
          data={messages}
          keyExtractor={messageItemKeyExtractor}
        />
        <View style={styles.inputContainer}>
          <BaseButton style={styles.emojiButton} onPress={toggleEmojiBoard}>
            <Icon
              type="material-icons"
              size={22}
              style={styles.emojiButtonIcon}
              name={showEmojiBoard ? 'keyboard' : 'insert-emoticon'}
            />
          </BaseButton>
          <TextInput
            multiline
            value={input}
            ref={inputRef}
            returnKeyType="send"
            onChangeText={setInput}
            style={styles.textInput}
            onFocus={closeEmojiBoard}
            onSubmitEditing={handleSubmit}
            enablesReturnKeyAutomatically={true}
            placeholder="Type a message"
          />
          {!!input && (
            <BaseButton
              title="Send"
              style={styles.submitButton}
              onPress={handleSubmit}>
              <Icon
                type="material-icons"
                name="send"
                style={baseButtonStyles.icon}
              />
            </BaseButton>
          )}
        </View>
      </ImageBackground>

      {showEmojiBoard && (
        <EmojiSelector
          showTabs={true}
          showHistory={true}
          showSearchBar={true}
          showSectionTitles={true}
          category={Categories.all}
          columns={12}
          onEmojiSelected={(emoji) => setInput(input + emoji)}
        />
      )}
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
    padding: 8,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 36,
    paddingVertical: 12,
    paddingLeft: 60,
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
  emojiButton: {
    left: 16,
    zIndex: 10,
    borderRadius: 36,
    position: 'absolute',
    backgroundColor: colors.white,
  },
  emojiButtonIcon: {
    opacity: 0.5,
    color: colors['gray-900'],
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

export default ChatScreen;
