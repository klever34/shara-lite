import PushNotification from 'react-native-push-notification'

class NotificationHandler {
  onNotification (notification: PushNotificationData) {
    if (typeof this._onNotification === 'function') {
      this._onNotification(notification)
    }
  }

  onRegister (token: PushNotificationToken) {
    if (typeof this._onRegister === 'function') {
      this._onRegister(token)
    }
  }

  attachRegister (handler: (token: PushNotificationToken) => void) {
    this._onRegister = handler
  }

  attachNotification (handler: (notification: PushNotificationData) => void) {
    this._onNotification = handler
  }
}

const handler = new NotificationHandler()

PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: handler.onRegister.bind(handler),

  // (required) Called when a remote or local notification is opened or received
  onNotification: handler.onNotification.bind(handler),
})

export default handler
