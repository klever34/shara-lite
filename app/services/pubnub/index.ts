import {useCallback, useEffect, useRef, useState} from 'react';
import {SignalEvent} from 'pubnub';
import {usePubNub} from 'pubnub-react';
import {useRealm} from '../realm';
import {useErrorHandler} from 'react-error-boundary';

export const useTyping = (channel: string, input: string = '') => {
  const pubNub = usePubNub();
  const realm = useRealm();
  const [reset, setReset] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const timer = useRef<NodeJS.Timeout | null>(null);
  const handleError = useErrorHandler();
  const stopTyping = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setIsTyping(false);
    try {
      await new Promise<any>((resolve, reject) => {
        pubNub.signal(
          {
            channel,
            message: 'TYPING_OFF',
          },
          (status, response) => {
            if (status.error) {
              reject(status);
            } else {
              resolve(response);
            }
          },
        );
      });
    } catch (e) {
      handleError(e);
    }
  }, [channel, handleError, pubNub]);
  const startTyping = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setIsTyping(true);
    try {
      await new Promise<any>((resolve, reject) => {
        pubNub.signal(
          {
            channel,
            message: 'TYPING_ON',
          },
          (status, response) => {
            if (status.error) {
              reject(status);
            } else {
              resolve(response);
            }
          },
        );
      });
    } catch (e) {
      handleError(e);
    }
    timer.current = setTimeout(() => {
      setReset(false);
      stopTyping();
    }, 10000);
  }, [channel, handleError, pubNub, stopTyping]);
  useEffect(() => {
    if (input && !isTyping) {
      if (reset) {
        startTyping();
      }
    } else if (!input) {
      setReset(true);
      stopTyping();
    }
  }, [reset, input, isTyping, startTyping, stopTyping]);
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

export * from './service';
