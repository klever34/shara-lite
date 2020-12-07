import {
  MessageAction,
  MessageActionEvent as PubNubMessageActionEvent,
} from 'pubnub';

export type MessageActionEvent = PubNubMessageActionEvent & {
  data: MessageAction;
  event: string;
};
