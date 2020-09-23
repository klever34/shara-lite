import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect} from 'react';
import BackgroundFetch from 'react-native-background-fetch';
import {getNotificationService} from '..';
import {getCredits} from '../CreditService';
import {useRealm} from '../realm';

export const useCreditReminder = () => {
  const realm = useRealm();
  const credits = getCredits({realm});
  const navigation = useNavigation();
  const notificationService = getNotificationService();

  const overdueCredits = credits.filter(
    (credit) =>
      credit.due_date && credit?.due_date?.getTime() <= new Date().getTime(),
  );

  const pushNotification = useCallback(() => {
    if (realm && overdueCredits.length) {
      notificationService.localNotification({
        title: 'Overdue Credit',
        message: `You have ${overdueCredits.length} overdue credit`,
      });
    }
  }, [notificationService, overdueCredits, realm]);

  useEffect(() => {
    BackgroundFetch.configure(
      {
        stopOnTerminate: false,
        minimumFetchInterval: 1440, // fetch interval in minutes
      },
      async (taskId) => {
        console.log('Received background-fetch event: ', taskId);

        pushNotification();

        BackgroundFetch.finish(taskId);
      },
      () => {
        console.error('RNBackgroundFetch failed to start.');
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return notificationService.addEventListener(() => {
      navigation.navigate('OverdueCredit');
      notificationService.cancelAllLocalNotifications();
    });
  }, [navigation, notificationService]);
};
