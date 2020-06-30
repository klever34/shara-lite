import React, {useCallback} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {FAButton} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {applyStyles} from '../../../helpers/utils';
import Icon from '../../../components/Icon';
import {colors} from '../../../styles';
import Touchable from '../../../components/Touchable';

type ChatListItemData = {id: string | number; title: string};

const chatList: ChatListItemData[] = [{id: 1, title: 'Shara Chat'}];

const ChatListScreen = () => {
  const navigation = useNavigation();
  const renderChatListItem = useCallback(
    ({item}: ListRenderItemInfo<ChatListItemData>) => {
      return (
        <Touchable
          onPress={() => {
            navigation.navigate('Chat', {title: item.title});
          }}>
          <View style={listItemStyles.container}>
            <View style={listItemStyles.imageContainer}>
              <Icon
                type="ionicons"
                name={
                  Platform.select({
                    android: 'md-globe',
                    ios: 'ios-globe',
                  }) as string
                }
                color="white"
                size={24}
              />
            </View>
            <View style={listItemStyles.titleContainer}>
              <Text style={listItemStyles.titleText}>{item.title}</Text>
            </View>
          </View>
        </Touchable>
      );
    },
    [navigation],
  );
  return (
    <View style={applyStyles('flex-1')}>
      <FlatList
        data={chatList}
        renderItem={renderChatListItem}
        keyExtractor={(item) => String(item.id)}
      />
      <FAButton
        iconName="text"
        onPress={() => {
          navigation.navigate('Contacts');
        }}
      />
    </View>
  );
};

const listItemStyles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: applyStyles('h-full', 'flex-1', {
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  }),
  imageContainer: applyStyles('center', {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    marginRight: 12,
  }),
  titleText: applyStyles('text-lg', {fontWeight: 'bold'}),
});

export default ChatListScreen;
