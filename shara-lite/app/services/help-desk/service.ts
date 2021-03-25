import RNZendeskChat from 'react-native-zendesk-v2';
import {User} from 'types/app';
import Config from 'react-native-config';
import {Alert} from 'react-native';

export interface IHelpDeskService {
  setUser(user: User): void;
  startChat(): void;
}

export class HelpDeskService implements IHelpDeskService {
  private user: User | null = null;
  constructor() {
    if (!Config.ZENDESK_CHAT_ACCOUNT_KEY) {
      Alert.alert('CHAT_ACCOUNT_KEY not set');
      return;
    }
    Alert.alert(
      Config.ZENDESK_CHAT_ACCOUNT_KEY +
        Config.ZENDESK_APP_ID +
        Config.ZENDESK_URL +
        Config.ZENDESK_CLIENT_ID,
    );
    RNZendeskChat.init({
      key: Config.ZENDESK_CHAT_ACCOUNT_KEY,
      appId: Config.ZENDESK_APP_ID,
      url: Config.ZENDESK_URL,
      clientId: Config.ZENDESK_CLIENT_ID,
    });
  }
  setUser(user: User) {
    if (!Config.ZENDESK_CHAT_ACCOUNT_KEY) {
      return;
    }
    this.user = user;
    // @ts-ignore
    RNZendeskChat.setUserIdentity({
      name: `${user.firstname} ${user.lastname}`,
      email: user.email ?? '',
    });
  }
  startChat() {
    if (!this.user) {
      return;
    }
    RNZendeskChat.startChat({
      name: `${this.user.firstname} ${this.user.lastname}`,
      email: this.user.email ?? '',
      botName: 'Shara Support',
    });
  }
}
