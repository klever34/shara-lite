import {IProduct} from '../app/models/Product'
import {ISupplier} from '../app/models/Supplier'

type Falsy = undefined | null | false

type User = {
  id: number
  firstname: string
  lastname: string
  mobile: string
  country_code: string
  created_at: string
  updated_at: string
  currency_code: string
  businesses: Business[]
}

type Business = {
  id: string
  name: string
  user_id: string
  address?: string
  created_at: string
  updated_at: string
  profile_image_url?: string | null
  signature_image_url?: string | null
}

type GroupChat = {
  name: string
  description: string | null
  uuid: string
  created_by: number
  created_at: string
  updated_at: string
  id: number
}

type GroupChatMember = {
  id: number
  user_id: number
  group_chat_id: number
  is_admin?: boolean
  created_at: string
  updated_at: string
  is_creator: boolean
  user?: User
}

type OneOnOneChannelCustom = {
  type: '1-1'
  members: string
}

type GroupChannelCustom = {
  type: 'group'
  id: number
  creatorId: number
  creatorMobile: string
}

type ChannelCustom = OneOnOneChannelCustom | GroupChannelCustom

type PushNotificationToken = {
  token: string
  os: string
}

type Product = {
  id: string
  name: string
  weight: string
  price: string
}

type ReceiptItem = {
  quantity: string
  price: string
  product: IProduct
}

type InventoryStockItem = {
  quantity: string
  cost_price?: string
  supplier: ISupplier
  product: IProduct
}

type Customer = {
  id: string
  mobile: string
  name: string
}
type ApiResponse<T extends any = any> = {
  data: any
  message: string
}
type CreditDetails = {
  id: string
  amount: number
  givenOn: string
  dueOn: string
  givenBy: string
}
type Order = {
  id: string
  amount: number
  paymentMethod: string
  status: string
  deliveryType: string
  location: string
  placedOn: string
  completedOn: string
}

type Payment = {
  amount: number
  method: string
  note?: string
}

// @ts-ignore
declare module 'country-currency-map'
// @ts-ignore
declare module 'react-native-signature-capture'
declare module 'react-native-bluetooth-escpos-printer'
