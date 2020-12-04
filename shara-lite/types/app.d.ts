import {IProduct} from '@/models/Product';
import {ObjectId} from 'bson';

type Falsy = undefined | null | false;

type User = {
  id: number;
  firstname: string;
  lastname: string;
  mobile: string;
  email?: string;
  country_code: string;
  created_at: string;
  updated_at: string;
  currency_code: string;
  businesses: Business[];
};

type Business = {
  id: string;
  name: string;
  slug?: string;
  user_id: string;
  address?: string;
  mobile?: string;
  created_at: string;
  updated_at: string;
  country_code?: string;
  profile_image?: {url: string};
  signature_image?: {url: string};
};

type PaymentProvider = {
  name: string;
  slug: string;
  fields: Array<{
    key: string;
    label: string;
  }>;
};

type GroupChat = {
  name: string;
  description: string | null;
  uuid: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  id: number;
};

type GroupChatMember = {
  id: number;
  user_id: number;
  group_chat_id: number;
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
  is_creator: boolean;
  user?: User;
};

type OneOnOneChannelCustom = {
  type: '1-1';
  members: string;
};

type GroupChannelCustom = {
  type: 'group';
  id: number;
  creatorId: number;
  creatorMobile: string;
};

type ChannelCustom = OneOnOneChannelCustom | GroupChannelCustom;

type PushNotificationToken = {
  token: string;
  os: string;
};

type Product = {
  id: string;
  name: string;
  weight: string;
  price: string;
};

type ReceiptItem = {
  quantity: string;
  price: string;
  product: IProduct;
};

type Customer = {
  _id: ObjectId;
  mobile: string;
  name: string;
};

type ApiResponse<T extends any = any> = {
  data: any;
  message: string;
};

type CreditDetails = {
  id: string;
  amount: number;
  givenOn: string;
  dueOn: string;
  givenBy: string;
};

type Order = {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  deliveryType: string;
  location: string;
  placedOn: string;
  completedOn: string;
};

type Payment = {
  amount: number;
  method: string;
  note?: string;
};

type IPGeolocationResponse = {
  ip: string;
  continent_code: string;
  continent_name: string;
  country_code2: string;
  country_code3: string;
  country_name: string;
  country_capital: string;
  state_prov: string;
  district: string;
  city: string;
  zipcode: string;
  latitude: string;
  longitude: string;
  calling_code: string;
  country_tld: string;
  country_flag: string;
  geoname_id: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
  time_zone: {
    name: string;
    offset: number;
    current_time: string;
    current_time_unix: number;
    is_dst: boolean;
    dst_savings: number;
  };
};

type StatusFilter = {
  label: string;
  value: 'all' | 'unpaid' | 'paid' | 'pending' | 'cancelled';
};

//@ts-ignore
declare module 'react-native-keyboard-aware-scrollview';
