import {PublishResponse, PubnubStatus} from 'pubnub';
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
  FlatList,
  ImageBackground,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
  Text,
} from 'react-native';
import EmojiSelector, {Categories} from 'react-native-emoji-selector';
import Icon from '../../../components/Icon';
import {BaseButton, baseButtonStyles} from '../../../components';
import {ChatBubble} from '../../../components/ChatBubble';
import {
  applyStyles,
  generateUniqueId,
  retryPromise,
} from '../../../helpers/utils';
import {colors} from '../../../styles';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '../index';
import {getAnalyticsService, getAuthService} from '../../../services';
import {useRealm} from '../../../services/realm';
import {UpdateMode} from 'realm';
import {IMessage} from '../../../models/Message';
import {useTyping} from '../../../services/pubnub';
import {MessageActionEvent} from '../../../../types/pubnub';
import {useErrorHandler} from 'react-error-boundary';
import HeaderTitle from '../../../components/HeaderTitle';
import {getBaseModelValues} from '../../../helpers/models';
import {useScreenRecord} from '../../../services/analytics';

type MessageItemProps = {
  item: IMessage;
};

const messageItemKeyExtractor = (message: IMessage) => message.id;

const ChatScreen = ({
  navigation,
  route,
}: StackScreenProps<MainStackParamList, 'Chat'>) => {
  useScreenRecord();
  const pubNub = usePubNub();
  const inputRef = useRef<any>(null);
  const conversation = route.params;
  const {channel, name} = conversation;
  const [input, setInput] = useState('');
  const typingMessage = useTyping(channel, input);
  const [showEmojiBoard, setShowEmojiBoard] = useState(false);
  const realm = useRealm() as Realm;
  const messages = realm
    .objects<IMessage>('Message')
    .filtered(`channel = "${channel}"`)
    .sorted('created_at', true);
  const me = getAuthService().getUser();

  const canChat = useMemo(() => {
    if (conversation.type === 'group') {
      return !!conversation.members.find((mobile) => me?.mobile === mobile);
    }
    return true;
  }, [conversation.members, conversation.type, me]);

  const handleError = useErrorHandler();
  useEffect(() => {
    const listener = () => {
      try {
        const markedMessages = realm
          .objects<IMessage>('Message')
          .filtered(
            `channel = "${channel}" AND read_timetoken = null AND author != "${
              me?.mobile ?? ''
            }"`,
          );
        if (markedMessages.length) {
          for (let i = 0; i < markedMessages.length; i += 1) {
            const {timetoken} = markedMessages[i];
            retryPromise(() => {
              return new Promise<any>((resolve, reject) => {
                pubNub.addMessageAction(
                  {
                    channel,
                    messageTimetoken: timetoken as string,
                    action: {type: 'receipt', value: 'message_read'},
                  },
                  (status, response) => {
                    if (status.error) {
                      reject(status);
                    } else {
                      resolve(response);
                    }
                  },
                );
              });
            }).then((response) => {
              realm.write(() => {
                markedMessages[i].read_timetoken = String(response.timetoken);
              });
            });
          }
        }
      } catch (error) {
        handleError(error);
      }
    };
    listener();
    realm.addListener('change', listener);
    return () => {
      realm.removeListener('change', listener);
    };
  }, [channel, handleError, me, pubNub, realm]);
  useEffect(() => {
    const listener = {
      messageAction: (evt: MessageActionEvent) => {
        try {
          if (
            evt.data.value === 'message_read' &&
            evt.publisher !== pubNub.getUUID()
          ) {
            const message = realm
              .objects<IMessage>('Message')
              .filtered(`timetoken="${evt.data.messageTimetoken}"`)[0];
            if (message) {
              realm.write(() => {
                message.read_timetoken = evt.timetoken;
              });
            }
          }
        } catch (e) {
          handleError(e);
        }
      },
    };
    pubNub.addListener(listener);
    return () => {
      pubNub.removeListener(listener);
    };
  }, [channel, handleError, pubNub, realm]);

  const headerDescription = useMemo(() => {
    if (conversation.type === 'group') {
      return typingMessage || 'tap here for group info';
    }
    return typingMessage;
  }, [conversation.type, typingMessage]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        return (
          <HeaderTitle
            title={name}
            description={headerDescription}
            onPress={() => {
              navigation.navigate('ChatDetails', conversation);
            }}
          />
        );
      },
    });
  }, [conversation, headerDescription, name, navigation]);
  const handleSubmit = useCallback(() => {
    setInput('');
    if (!me) {
      return;
    }
    let message: IMessage = {
      id: generateUniqueId(),
      content: input,
      created_at: new Date(),
      author: me.mobile,
      channel,
    };
    const messagePayload = {
      pn_gcm: {
        notification: {
          title: `${me?.firstname} ${me?.lastname}`,
          body: input,
        },
        data: message,
      },
      ...message,
    };
    try {
      realm.write(() => {
        message = realm.create<IMessage>(
          'Message',
          {...message, ...getBaseModelValues()},
          UpdateMode.Never,
        );
        conversation.lastMessage = message;
      });
    } catch (e) {
      handleError(e);
    }
    retryPromise(() => {
      return new Promise<any>((resolve, reject) => {
        // TODO: Separate message publish from notification publish
        pubNub.publish({channel, message: messagePayload}, function (
          status: PubnubStatus,
          response: PublishResponse,
        ) {
          if (status.error) {
            reject(status);
          } else {
            resolve(response);
          }
        });
      });
    })
      .then((response) => {
        realm.write(() => {
          message.timetoken = String(response.timetoken);
        });
        return getAnalyticsService().logEvent('messageSent');
      })
      .catch(handleError);
  }, [
    channel,
    conversation.lastMessage,
    handleError,
    input,
    me,
    pubNub,
    realm,
  ]);

  const renderMessageItem = useCallback(
    ({item: message}: MessageItemProps) => <ChatBubble message={message} />,
    [],
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
        source={require('../../../assets/images/chat-wallpaper.png')}
        style={styles.chatBackground}>
        <FlatList
          inverted={true}
          style={styles.listContainer}
          renderItem={renderMessageItem}
          data={messages}
          keyExtractor={messageItemKeyExtractor}
        />
        {canChat ? (
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
        ) : (
          <View style={applyStyles('bg-white p-lg')}>
            <Text style={applyStyles('text-center text-gray-200')}>
              You can't send messages to this group because you're no longer a
              participant
            </Text>
          </View>
        )}
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
    fontFamily: 'Rubik-Regular',
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
  headerTitleText: {
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Rubik-Medium',
  },
  headerTitleDesc: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Rubik-Regular',
  },
});

export default ChatScreen;
