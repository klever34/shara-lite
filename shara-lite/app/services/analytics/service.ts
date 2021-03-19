import {castObjectValuesToString} from '@/helpers/utils'
import {ReminderUnit, ReminderWhen} from '@/models/PaymentReminder'
import {IStorageService} from '@/services/storage'
import getFirebaseAnalytics from '@react-native-firebase/analytics'
import {utils as firebaseUtils} from '@react-native-firebase/app'
import getFirebaseCrashlytics from '@react-native-firebase/crashlytics'
import segmentAnalytics from '@segment/analytics-react-native'
import * as Sentry from '@sentry/react-native'
import {parse as parseQueryString} from 'query-string'
import Config from 'react-native-config'
import {AppEventsLogger} from 'react-native-fbsdk'
import {PlayInstallReferrer} from 'react-native-play-install-referrer'
// @ts-ignore
import RNUxcam from 'react-native-ux-cam'
import {User} from 'types/app'

export type SharaAppEventsProperties = {
  // Chat
  messageSent: {}
  oneOnOneChatInitiated: {}
  groupChatCreated: {}
  // Onboarding
  businessSetupComplete: {}
  businessSetupStart: {}
  login: {method: string}
  logout: {}
  signup: {method: string}
  userProfileUpdated: {}
  // Customer
  customerEdited: {}
  customerDeleted: {}
  customerLocationAdded: {user_id: string}
  customerAdded: {source: 'manual' | 'phonebook'}
  // Receipts
  creditPaid: {
    item_id: string
    amount: string
    currency_code: string
    method: string
    remaining_balance: string
  }
  receiptStart: {}
  receiptCreated: {amount: string; currency_code: string}
  paymentMade: {
    item_id: string
    method: string
    amount: string
    currency_code: string
  }
  productAddedToReceipt: {}
  customerAddedToReceipt: {}
  // Content
  share: {item_id: string; content_type: string; method: string}
  selectContent: {item_id: string; content_type: string}
  search: {search_term: string; content_type: string}
  print: {item_id: string; content_type: string}
  // Credit Management
  creditAdded: {item_id: string; amount: string; currency_code: string}
  // Inventory
  supplierAdded: {}
  productStart: {}
  productAdded: {}
  inventoryReceived: {}
  deliveryAgentAdded: {}
  //Sync
  syncStarted: {}
  syncCompleted: {}
  //Payment
  paymentOptionAdded: {}
  paymentOptionEdited: {}
  copiedPaymentOption: {}
  previewPaymentInfo: {}
  paymentOptionRemoved: {}
  paymentPreviewLabelEdited: {}
  copiedPaymentLink: {}
  //Transactions
  userSavedTransaction: {
    amountPaid: number
    creditAmount: number
    totalAmount: number
    currency_code: string
  }
  userRecordCollection: {
    amount: number
    currency_code: string
  }
  userRecordSaleWithCredit: {
    amountPaid: number
    creditAmount: number
    totalAmount: number
    currency_code: string
  }
  userRecordSaleWithoutCredit: {
    amountPaid: number
    creditAmount: number
    totalAmount: number
    currency_code: string
  }
  setCollectionDate: {}
  userUpdatedTransaction: {}
  userDeletedTransaction: {}
  detailsEnteredToTransaction: {}
  customerAddedToTransaction: {}
  //Referral
  friendInvited: {}
  referralCodeAdded: {}
  //Report
  userViewedReport: {}
  userDownloadedReport: {}
  userSharedReport: {}
  // Reminders
  userAddedReminder: {
    id: string
    amount: number
    when: ReminderWhen
    unit: ReminderUnit
    due_date: string
    customer: string
  }
  userUpdatedReminder: {
    id: string
    amount: number
    when: ReminderWhen
    unit: ReminderUnit
    due_date: string
    customer: string
  }
  userRemovedReminder: {
    id: string
    amount: number
    when: ReminderWhen
    unit: ReminderUnit
    due_date: string
    customer: string
  }
  feedbackSaved: {}
  comingSoonPrompted: {feature: string}

  // Money
  moneyWithdrawn: {
    amount: number
    bank_details: string
  }
  takeDrawdown: {
    amount: number
  }
  initiateDepositSTKPush: {
    amount: number
  }
  updateCollectionWithCustomer: {}

  //BNPL
  takeBNPLDrawdown: {
    amount: number
    receipt_id: string
    repayment_amount: number
  }
  bnplRepayment: {
    amount: number
    drawdown_id: string
  }
}

export interface IAnalyticsService {
  initialize(): Promise<void>

  setUser(user: User): Promise<void>

  logEvent<K extends keyof SharaAppEventsProperties>(
    eventName: K,
    eventData: SharaAppEventsProperties[K],
  ): Promise<void>

  tagScreenName(screenName: string): Promise<void>
}

export class AnalyticsService implements IAnalyticsService {
  private firebaseAnalytics = getFirebaseAnalytics()
  private firebaseCrashlytics = getFirebaseCrashlytics()
  private installReferrer: {[key: string]: string} | null = null

  constructor (private storageService: IStorageService) {}

  async initialize (): Promise<void> {
    try {
      if (
        process.env.NODE_ENV === 'production' &&
        !firebaseUtils().isRunningInTestLab
      ) {
        await segmentAnalytics.setup(Config.SEGMENT_KEY, {
          recordScreenViews: true,
          trackAppLifecycleEvents: true,
        })

        RNUxcam.optIntoSchematicRecordings()
        RNUxcam.setAutomaticScreenNameTagging(false)
        RNUxcam.startWithKey(Config.UXCAM_KEY)
      }
    } catch (e) {
      throw e
    }
  }

  async setUser (user: User): Promise<void> {
    try {
      this.installReferrer = await this.storageService.getItem(
        '@shara/install_referrer',
      )
      if (this.installReferrer === null) {
        await new Promise((resolve, reject) => {
          PlayInstallReferrer.getInstallReferrerInfo(
            (
              installReferrerInfo: {
                installReferrer: string
                referrerClickTimestampSeconds: string
                installBeginTimestampSeconds: string
                referrerClickTimestampServerSeconds: string
                installBeginTimestampServerSeconds: string
                installVersion: string
                googlePlayInstant: string
              },
              error: {responseCode: string; message: string},
            ) => {
              if (!error) {
                this.installReferrer = parseQueryString(
                  installReferrerInfo.installReferrer,
                ) as {[key: string]: string}
                this.storageService
                  .setItem('@shara/install_referrer', this.installReferrer)
                  .then(resolve)
                  .catch(reject)
              } else {
                reject(error)
              }
            },
          )
        })
      }
    } catch (e) {}
    try {
      const userFields: (keyof User)[] = [
        'firstname',
        'lastname',
        'id',
        'country_code',
        'mobile',
        'currency_code',
        'referrer_code',
      ]
      const userData: {[key: string]: string} = userFields.reduce(
        (acc, prop) => {
          return {
            ...acc,
            [prop]: String(user[prop]),
          }
        },
        {},
      )
      if (this.installReferrer) {
        Object.keys(this.installReferrer)
          .filter(utmKey => {
            return ['gclid'].includes(utmKey)
          })
          .forEach(utmKey => {
            userData[utmKey] = this.installReferrer?.[utmKey] ?? ''
          })
      }
      userData.environment = Config.ENVIRONMENT
      userData.businessName = user.businesses?.[0]?.name ?? ''
      userData.referralCode = user.referrer_code ?? ''
      userData.app = 'shara-lite'
      const alias =
        user.firstname && user.lastname
          ? `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim()
          : String(user.id)

      RNUxcam.setUserIdentity(user.ux_cam_id || alias)
      for (let prop in userData) {
        RNUxcam.setUserProperty(prop, userData[prop])
      }
      RNUxcam.setUserProperty('alias', alias)

      await segmentAnalytics.identify(String(user.id), userData)
      await segmentAnalytics.alias(alias)

      await this.firebaseAnalytics.setUserId(String(user.id))
      await this.firebaseAnalytics.setUserProperties(userData)

      await this.firebaseCrashlytics.setUserId(String(user.id))
      await this.firebaseCrashlytics.setAttributes(userData)

      Sentry.setUser(userData)
    } catch (e) {
      throw e
    }
  }

  async logEvent<K extends keyof SharaAppEventsProperties> (
    eventName: K,
    eventData: SharaAppEventsProperties[K],
  ): Promise<void> {
    let nextEventData
    if (eventData) {
      nextEventData = castObjectValuesToString(
        eventData as {
          [key: string]: any
        },
      )
    }
    try {
      await this.firebaseAnalytics.logEvent(eventName, eventData)
      await segmentAnalytics.track(eventName, nextEventData)
      RNUxcam.logEvent(eventName, nextEventData)
      AppEventsLogger.logEvent(eventName, nextEventData ?? {})
    } catch (e) {
      throw e
    }
  }

  async tagScreenName (screenName: string): Promise<void> {
    RNUxcam.tagScreenName(screenName)
    await segmentAnalytics.screen(screenName)
    await this.firebaseAnalytics.logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    })
    return Promise.resolve()
  }
}
