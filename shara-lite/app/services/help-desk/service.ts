import RNZendeskChat from 'react-native-zendesk-v2';
import {User} from 'types/app';
import Config from 'react-native-config';

export interface IHelpDeskService {
  setUser(user: User): void;
  startChat(): void;
}

export class HelpDeskService implements IHelpDeskService {
  private user: User | null = null;
  constructor() {
    RNZendeskChat.init({
      key: Config.ZENDESK_CHAT_ACCOUNT_KEY,
      appId: Config.ZENDESK_APP_ID,
      url: Config.ZENDESK_URL,
      clientId: Config.ZENDESK_CLIENT_ID,
    });
  }
  setUser(user: User) {
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
