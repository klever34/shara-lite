import {User} from 'types/app';
import segmentAnalytics from '@segment/analytics-react-native';
import Config from 'react-native-config';
// @ts-ignore
import RNUxcam from 'react-native-ux-cam';
import {castObjectValuesToString} from '@/helpers/utils';
import getFirebaseAnalytics from '@react-native-firebase/analytics';
import {utils as firebaseUtils} from '@react-native-firebase/app';

export type SharaAppEventsProperties = {
  // Chat
  messageSent: {};
  oneOnOneChatInitiated: {};
  groupChatCreated: {};
  // Onboarding
  businessSetupComplete: {};
  businessSetupStart: {};
  login: {method: string};
  logout: {};
  signup: {method: string};
  // Customer
  customerLocationAdded: {user_id: string};
  customerAdded: {source: 'manual' | 'phonebook'};
  // Receipts
  creditPaid: {
    item_id: string;
    amount: string;
    currency_code: string;
    method: string;
    remaining_balance: string;
  };
  receiptStart: {};
  receiptCreated: {amount: string; currency_code: string};
  paymentMade: {
    item_id: string;
    method: string;
    amount: string;
    currency_code: string;
  };
  productAddedToReceipt: {};
  customerAddedToReceipt: {};
  detailsEnteredToReceipt: {};
  // Content
  share: {item_id: string; content_type: string; method: string};
  selectContent: {item_id: string; content_type: string};
  search: {search_term: string; content_type: string};
  print: {item_id: string; content_type: string};
  // Credit Management
  creditAdded: {item_id: string; amount: string; currency_code: string};
  // Inventory
  supplierAdded: {};
  productStart: {};
  productAdded: {};
  inventoryReceived: {};
  deliveryAgentAdded: {};
  //Sync
  syncStarted: {};
  syncCompleted: {};
  //Referral
  friendInvited: {};
  referralCodeAdded: {};
  //Transaction
  userSavedTransaction: {}
  userUpdatedTransaction: {}
  userDeletedTransaction: {}
};

export interface IAnalyticsService {
  initialize(): Promise<void>;

  setUser(user: User): Promise<void>;

  logEvent<K extends keyof SharaAppEventsProperties>(
    eventName: K,
    eventData: SharaAppEventsProperties[K],
  ): Promise<void>;

  tagScreenName(screenName: string): Promise<void>;
}

export class AnalyticsService implements IAnalyticsService {
  private firebaseAnalytics = getFirebaseAnalytics();

  async initialize(): Promise<void> {
    try {
      if (
        process.env.NODE_ENV === 'production' &&
        !firebaseUtils().isRunningInTestLab
      ) {
        await segmentAnalytics.setup(Config.SEGMENT_KEY, {
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
        'lastname',
        'id',
        'country_code',
        'mobile',
        'currency_code',
        'referrer_code',
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
      userData.businessName = user.businesses?.[0]?.name ?? '';
      userData.referralCode = user.referrer_code ?? '';
      userData.app = 'shara-plus';
      const alias =
        user.firstname && user.lastname
          ? `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim()
          : String(user.id);

      RNUxcam.setUserIdentity(user.ux_cam_id || alias);
      for (let prop in userData) {
        RNUxcam.setUserProperty(prop, userData[prop]);
      }
      RNUxcam.setUserProperty('alias', alias);

      await segmentAnalytics.identify(String(user.id), userData);
      await segmentAnalytics.alias(alias);

      await this.firebaseAnalytics.setUserId(String(user.id));
      await this.firebaseAnalytics.setUserProperties(userData);
    } catch (e) {
      throw e;
    }
  }

  async logEvent<K extends keyof SharaAppEventsProperties>(
    eventName: K,
    eventData: SharaAppEventsProperties[K],
  ): Promise<void> {
    let nextEventData;
    if (eventData) {
      nextEventData = castObjectValuesToString(
        eventData as {
          [key: string]: any;
        },
      );
    }
    try {
      await this.firebaseAnalytics.logEvent(eventName, eventData);
      await segmentAnalytics.track(eventName, nextEventData);
      RNUxcam.logEvent(eventName, nextEventData);
    } catch (e) {
      throw e;
    }
  }

  async tagScreenName(screenName: string): Promise<void> {
    RNUxcam.tagScreenName(screenName);
    await segmentAnalytics.screen(screenName);
    await this.firebaseAnalytics.logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
    return Promise.resolve();
  }
}
