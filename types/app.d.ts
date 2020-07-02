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

declare module 'react-native-push-notification'
