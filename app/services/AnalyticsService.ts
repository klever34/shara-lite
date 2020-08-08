import {User} from '../../types/app';
import analytics from '@segment/analytics-react-native';
import Config from 'react-native-config';
// @ts-ignore
import RNUxcam from 'react-native-ux-cam';
import {castObjectValuesToString} from '../helpers/utils';

export interface IAnalyticsService {
  initialize(): Promise<void>;
  setUser(user: User): Promise<void>;
  logEvent(eventName: string, eventData?: {[key: string]: any}): Promise<void>;
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

  async logEvent(
    eventName: string,
    eventData?: {[p: string]: any},
  ): Promise<void> {
    if (eventData) {
      eventData = castObjectValuesToString(eventData);
    }
    try {
      await analytics.track(eventName, eventData);
      // RNUxcam.logEvent(eventName, eventData);
    } catch (e) {
      throw e;
    }
  }
}
