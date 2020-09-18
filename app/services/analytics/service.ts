import {User} from 'types/app';
import analytics from '@segment/analytics-react-native';
import Config from 'react-native-config';
// @ts-ignore
import RNUxcam from 'react-native-ux-cam';
import {castObjectValuesToString} from '@/helpers/utils';

type SharaAppEventsProperties = {
  // Chat
  messageSent: undefined;
  oneOnOneChatInitiated: undefined;
  groupChatCreated: undefined;
  // Onboarding
  businessSetupComplete: undefined;
  businessSetupStart: undefined;
  login: {method: string};
  logout: undefined;
  signup: {method: string};
  // Customer
  customerLocationAdded: {user_id: string};
  customerAdded: undefined;
  // Receipts
  creditPaid: {
    item_id: string;
    amount: string;
    method: string;
    remaining_balance: string;
  };
  receiptStart: undefined;
  receiptCreated: undefined;
  paymentMade: {item_id: string; method: string; amount: string};
  customerAddedToReceipt: undefined;
  // Content
  share: {item_id: string; content_type: string; method: string};
  selectContent: {item_id: string; content_type: string};
  search: {search_term: string; content_type: string};
  print: {item_id: string; content_type: string};
  // Credit Management
  creditAdded: {item_id: string; amount: string};
  // Inventory
  supplierAdded: undefined;
  productStart: undefined;
  productAdded: undefined;
  inventoryReceived: undefined;
  deliveryAgentAdded: undefined;
};

export interface IAnalyticsService {
  initialize(): Promise<void>;

  setUser(user: User): Promise<void>;

  logEvent<K extends keyof SharaAppEventsProperties>(
    eventName: K,
    eventData?: SharaAppEventsProperties[K],
  ): Promise<void>;

  tagScreenName(screenName: string): Promise<void>;
}

export class AnalyticsService implements IAnalyticsService {
  async initialize(): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'production') {
        await analytics.setup(Config.SEGMENT_KEY, {
          recordScreenViews: true,
          trackAppLifecycleEvents: true,
        });
        RNUxcam.optIntoSchematicRecordings();
        RNUxcam.setAutomaticScreenNameTagging(false);
        RNUxcam.startWithKey(Config.UXCAM_KEY);
      }
    } catch (e) {
      throw e;
    }
  }

  async setUser(user: User): Promise<void> {
    try {
      const userFields: (keyof User)[] = [
        'firstname',
        'id',
        'country_code',
        'currency_code',
      ];
      const userData: {[key: string]: string} = userFields.reduce(
        (acc, prop) => {
          return {
            ...acc,
            [prop]: String(user[prop]),
          };
        },
        {},
      );
      userData.environment = Config.ENVIRONMENT;
      const alias = `${user.firstname}`;

      RNUxcam.setUserIdentity(alias);
      for (let prop in userData) {
        RNUxcam.setUserProperty(prop, userData[prop]);
      }
      RNUxcam.setUserProperty('alias', alias);

      await analytics.identify(String(user.id), userData);
      await analytics.alias(alias);
    } catch (e) {
      throw e;
    }
  }

  async logEvent<K extends keyof SharaAppEventsProperties>(
    eventName: K,
    eventData?: SharaAppEventsProperties[K],
  ): Promise<void> {
    let nextEventData;
    if (eventData) {
      nextEventData = castObjectValuesToString(eventData as any);
    }
    try {
      await analytics.track(eventName, nextEventData);
      // RNUxcam.logEvent(eventName, nextEventData);
    } catch (e) {
      throw e;
    }
  }

  tagScreenName(screenName: string): Promise<void> {
    RNUxcam.tagScreenName(screenName);
    return Promise.resolve();
  }
}
