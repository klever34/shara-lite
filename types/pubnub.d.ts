import {
  MessageAction,
  MessageActionEvent as PubNubMessageActionEvent,
} from 'pubnub';

type MessageActionEvent = PubNubMessageActionEvent & {
  data: MessageAction;
  event: string;
};
