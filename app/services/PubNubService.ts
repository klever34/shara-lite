import {useEffect, useState} from 'react';
import {SignalEvent} from 'pubnub';
import {usePubNub} from 'pubnub-react';
import {useRealm} from './RealmService';

export const useTyping = (channel: string, input: string = '') => {
  const pubNub = usePubNub();
  const realm = useRealm();
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  useEffect(() => {
    if (input && !isTyping) {
      setIsTyping(true);
      pubNub.signal(
        {
          channel,
          message: 'TYPING_ON',
        },
        (status) => {
          if (status.error) {
            console.log('TYPING_ON Signal Error: ', status);
          }
        },
      );
    } else if (!input && isTyping) {
      setIsTyping(false);
      pubNub.signal(
        {
          channel,
          message: 'TYPING_OFF',
        },
        (status) => {
          if (status.error) {
            console.log('TYPING_OFF Signal Error: ', status);
          }
        },
      );
    }
  }, [input, isTyping, pubNub, channel]);
  useEffect(() => {
    if (pubNub) {
      const listener = {
        signal: (envelope: SignalEvent) => {
          if (
            channel === envelope.channel &&
            envelope.message === 'TYPING_ON' &&
            envelope.publisher !== pubNub.getUUID()
          ) {
            setTypingMessage('typing...');
          } else {
            setTypingMessage('');
          }
        },
      };
      // Add the listener to pubNub instance and subscribe to `chat` channel.
      pubNub.addListener(listener);
      // We need to return a function that will handle unsubscription on unmount
      return () => {
        pubNub.removeListener(listener);
      };
    }
  }, [channel, pubNub, realm]);
  return typingMessage;
};
