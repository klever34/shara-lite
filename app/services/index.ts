import StorageService, {IStorageService} from './StorageService'
import ContactsService, {IContactsService} from './ContactsService'
import PushNotificationService from './PushNotificationService'

let storageService: IStorageService | null = null
let contactsService: IContactsService | null = null
let pushNotificationService: any | null = null

export const getStorageService = () => {
  if (!storageService) {
    storageService = new StorageService()
  }
  return storageService
}

export const getContactsService = () => {
  if (!contactsService) {
    contactsService = new ContactsService()
  }
  return contactsService
}

export const getPushNotificationService = (
  onRegister: (token: PushNotificationToken) => void,
  onNotification: (notification: PushNotificationData) => void,
) => {
  if (!pushNotificationService) {
    pushNotificationService = new PushNotificationService(
      onRegister,
      onNotification,
    )
  }
  return pushNotificationService
}
