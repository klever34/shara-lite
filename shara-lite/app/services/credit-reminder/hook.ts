import {useNavigation} from '@react-navigation/native';
import {isTomorrow} from 'date-fns';
import {useCallback, useEffect} from 'react';
import BackgroundFetch from 'react-native-background-fetch';
import {getNotificationService} from '..';
import {useRealm} from '../realm';
import {useCredit} from '@/services/credit';

export const useCreditReminder = () => {
  const realm = useRealm();
  const {getCredits} = useCredit();
  const credits = realm ? getCredits() : [];
  const navigation = useNavigation();
  const notificationService = getNotificationService();

  const overdueCredits = credits.filter(
    (credit) =>
      !credit.fulfilled &&
      credit.due_date &&
      credit?.due_date?.getTime() <= new Date().getTime(),
  );

  const creditDueTomorrow = credits.filter(
    (credit) =>
      !credit.fulfilled && credit.due_date && isTomorrow(credit.due_date),
  );

  const overdueCreditNotification = useCallback(() => {
    if (realm && overdueCredits.length) {
      notificationService.localNotification({
        id: 0,
        title: 'Overdue Credit',
        message:
          overdueCredits.length > 1
            ? `You have ${overdueCredits.length} customers who owe you`
            : `You have ${overdueCredits.length} customer who owes you`,
      });
    }
  }, [notificationService, overdueCredits, realm]);

  const dueTomorrowNotification = useCallback(() => {
    const creditNumber = creditDueTomorrow.length;
    if (realm && creditNumber) {
      const message =
        creditNumber > 1
          ? `You have ${creditNumber} credits due tomorrow. Do you want to send reminders?`
          : `You have ${creditNumber} credit due tomorrow. Do you want to send a reminder?`;
      notificationService.localNotification({
        id: 1,
        message,
        title: 'Credit due tomorrow',
      });
    }
  }, [realm, creditDueTomorrow.length, notificationService]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    BackgroundFetch.configure(
      {
        stopOnTerminate: false,
        minimumFetchInterval: 1440, // fetch interval in minutes
      },
      async (taskId) => {
        console.log('Received background-fetch event: ', taskId);

        overdueCreditNotification();

        dueTomorrowNotification();

        BackgroundFetch.finish(taskId);
      },
      () => {
        console.error('RNBackgroundFetch failed to start.');
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return notificationService.addEventListener((notification: any) => {
      if (notification.id === '0') {
        navigation.navigate('SalesTab');
        notificationService.cancelAllLocalNotifications();
      }
      if (notification.id === '1') {
        navigation.navigate('SalesTab');
        notificationService.cancelAllLocalNotifications();
      }
    });
  }, [navigation, notificationService]);
};
