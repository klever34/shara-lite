import PubNub, {MessageEvent, SignalEvent} from 'pubnub';
import {MessageActionEvent} from 'types-v1/pubnub';

type MessageEventListener = (messageEvent: MessageEvent) => void;
type SignalEventListener = (signalEvent: SignalEvent) => void;
type MessageActionEventListener = (
  messageActionEvent: MessageActionEvent,
) => void;

export interface IPubNubService {
  getInstance(): PubNub | null;
  setInstance(PubNub: PubNub): void;
  initialize(): void;
  addMessageEventListener(listener: MessageEventListener): () => void;
  addSignalEventListener(listener: SignalEventListener): () => void;
  addMessageActionEventListener(
    listener: MessageActionEventListener,
  ): () => void;
}

export class PubNubService implements IPubNubService {
  private pubNub: PubNub | null = null;
  private messageEventListeners: MessageEventListener[] = [];
  private signalEventListeners: SignalEventListener[] = [];
  private messageActionEventListeners: MessageActionEventListener[] = [];

  public getInstance() {
    return this.pubNub;
  }

  public setInstance(pubNub: PubNub) {
    if (!this.pubNub) {
      this.pubNub = pubNub;
    }
  }

  initialize(): () => void {
    const listener = {
      message: (messageEvent: MessageEvent) => {
        this.messageEventListeners.forEach((messageEventLister) => {
          messageEventLister(messageEvent);
        });
      },
      signal: (signalEvent: SignalEvent) => {
        this.signalEventListeners.forEach((signalEventListener) => {
          signalEventListener(signalEvent);
        });
      },
      messageAction: (messageActionEvent: MessageActionEvent) => {
        this.messageActionEventListeners.forEach(
          (messageActionEventListener) => {
            messageActionEventListener(messageActionEvent);
          },
        );
      },
    };
    this.pubNub?.addListener(listener);
    return () => {
      this.pubNub?.removeListener(listener);
    };
  }

  addMessageEventListener(listener: MessageEventListener): () => void {
    this.messageEventListeners = [...this.messageEventListeners, listener];
    return () => {
      this.messageEventListeners = this.messageEventListeners.filter(
        (listenerItem) => listenerItem !== listener,
      );
    };
  }

  addSignalEventListener(listener: SignalEventListener): () => void {
    this.signalEventListeners = [...this.signalEventListeners, listener];
    return () => {
      this.signalEventListeners = this.signalEventListeners.filter(
        (listenerItem) => listenerItem !== listener,
      );
    };
  }

  addMessageActionEventListener(
    listener: MessageActionEventListener,
  ): () => void {
    this.messageActionEventListeners = [
      ...this.messageActionEventListeners,
      listener,
    ];
    return () => {
      this.messageActionEventListeners = this.messageActionEventListeners.filter(
        (listenerItem) => listenerItem !== listener,
      );
    };
  }
}
