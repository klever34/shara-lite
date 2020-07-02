import PushNotification from 'react-native-push-notification'
import NotificationHandler from '../helpers/notification-handler'

export default class PushNotificationService {
  constructor (onRegister: any, onNotification: any) {
    NotificationHandler.attachRegister(onRegister)
    NotificationHandler.attachNotification(onNotification)

    // Clear badge number at start
    PushNotification.getApplicationIconBadgeNumber((number: number) => {
      if (number > 0) {
        PushNotification.setApplicationIconBadgeNumber(0)
      }
    })
  }
}
