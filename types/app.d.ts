type User = {
  id: number
  email?: string
  firstname?: string
  lastname?: string
  mobile?: string
}

type MessageAuthor = Pick<User, 'firstname' | 'lastname' | 'mobile' | 'id'>

type ChatMessage = {
  id: string
  device: string
  created_at: number
  content: string
  author: MessageAuthor
  timetoken?: string | number
}

type PushNotificationToken = {
  token: string
  os: string
}

type PushNotificationData = {
  foreground: boolean
  userInteraction: boolean
  message: string
  data: any
}

type Product = {
  id: string
  name: string
  weight: string
  price?: string
}

type ReceiptItem = Product & {quantity?: string}

type Customer = {
  id: string
  mobile: string
  name: string
}

declare module 'react-native-signature-capture'

declare module 'react-native-push-notification'
