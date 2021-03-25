import RNZendeskChat from 'react-native-zendesk-v2';
import {User} from 'types/app';
import Config from 'react-native-config';
import {INotificationService} from '@/services/notification';

export interface IHelpDeskService {
  setUser(user: User): void;
  startChat(): void;
}

export class HelpDeskService implements IHelpDeskService {
  private user: User | null = null;
  constructor(private notificationService: INotificationService) {
    RNZendeskChat.init({
      key: Config.ZENDESK_CHAT_ACCOUNT_KEY,
      appId: Config.ZENDESK_APP_ID,
      url: Config.ZENDESK_URL,
      clientId: Config.ZENDESK_CLIENT_ID,
    });
    this.notificationService.getFCMToken().then((token) => {
      if (!token) {
        return;
      }
      RNZendeskChat.setNotificationToken(token);
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
      chatOnly: true,
    });
  }
}
