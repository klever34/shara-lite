import {PublishResponse, PubnubStatus} from 'pubnub';
import {usePubNub} from 'pubnub-react';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {
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
import {useRealm} from '../../services/RealmService';
import {UpdateMode} from 'realm';
import {IConversation, IMessage} from '../../models';
import {useTyping} from '../../services/PubNubService';

type MessageItemProps = {
  item: IMessage;
};

const messageItemKeyExtractor = (message: IMessage) => message.id;

const ChatScreen = ({
  navigation,
  route,
}: StackScreenProps<MainStackParamList, 'Chat'>) => {
  const pubNub = usePubNub();
  const inputRef = useRef<any>(null);
  const {channel, title} = route.params;
  const [input, setInput] = useState('');
  const typingMessage = useTyping(channel, input);
  const [showEmojiBoard, setShowEmojiBoard] = useState(false);
  const realm = useRealm() as Realm;
  const messages = realm
    .objects<IMessage>('Message')
    .filtered(`channel = "${channel}"`)
    .sorted('created_at', true);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        return (
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>{title}</Text>
            {!!typingMessage && (
              <Text style={styles.headerTitleDesc}>{typingMessage}</Text>
            )}
          </View>
        );
      },
    });
  }, [navigation, title, typingMessage]);

  const handleSubmit = useCallback(() => {
    setInput('');
    const authService = getAuthService();
    const user = authService.getUser() as User;
    let message: IMessage = {
      id: generateUniqueId(),
      content: input,
      created_at: new Date(),
      author: user.mobile,
      channel,
    };
    const messagePayload = {
      pn_gcm: {
        notification: {
          title: `${user?.firstname} ${user?.lastname}`,
          body: input,
        },
        data: {
          ...message,
          channel,
        },
      },
      ...message,
    };
    try {
      realm.write(() => {
        message = realm.create<IMessage>('Message', message, UpdateMode.Never);
      });
    } catch (e) {
      console.log('Error: ', e);
    }
    pubNub.publish({channel, message: messagePayload}, function (
      status: PubnubStatus,
      response: PublishResponse,
    ) {
      if (status.error) {
        console.log('Error: ', status.errorData?.message);
      } else {
        realm.write(() => {
          message.sent_timetoken = String(response.timetoken);
        });
        realm.write(() => {
          const conversation = realm
            .objects<IConversation>('Conversation')
            .filtered(`channel = "${message.channel}"`)[0];
          conversation.lastMessage = message;
        });
      }
    });
  }, [channel, input, pubNub, realm]);

  const renderMessageItem = useCallback(({item: message}: MessageItemProps) => {
    const authService = getAuthService();
    const user = authService.getUser() as User;
    if (!user) {
      return null;
    }
    return <ChatBubble message={message} user={user} />;
  }, []);

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
        <FlatList
          inverted={true}
          style={styles.listContainer}
          renderItem={renderMessageItem}
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
  headerTitle: {
    flexDirection: 'column',
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
