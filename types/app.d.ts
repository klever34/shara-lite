type User = {
  id: number;
  firstname: string;
  lastname: string;
  mobile: string;
  country_code: string;
  created_at: string;
  updated_at: string;
};

type PushNotificationToken = {
  token: string;
  os: string;
};

type PushNotificationData = {
  foreground: boolean;
  userInteraction: boolean;
  message: string;
  data: any;
};

type Product = {
  id: string;
  name: string;
  weight: string;
  price: string;
};

type ReceiptItem = Product & {quantity: string};

type Customer = {
  id: string;
  mobile: string;
  name: string;
};
type ApiResponse<T extends any = any> = {
  data: any;
  message: string;
};
type CustomerItemProps = {
  item: Customer;
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

declare module 'react-native-signature-capture';

declare module 'react-native-push-notification';
