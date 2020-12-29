import {Button} from '@/components';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useRef, useState} from 'react';
import {Image, Text, View} from 'react-native';
import Swiper from 'react-native-swiper';

export const Welcome = () => {
  const swiperRef = useRef(null);
  const navigation = useAppNavigation();

  const [count, setCount] = useState(0);

  const handleSkip = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (count < 3) {
      const i = count + 1;
      //@ts-ignore
      swiperRef?.current?.scrollBy(i);
    }
  }, [count]);

  const handleUpdateCount = useCallback((index) => {
    setCount(index);
  }, []);

  return (
    <View style={applyStyles('flex-1 bg-white')}>
      <Swiper
        loop={false}
        ref={swiperRef}
        showsPagination
        onIndexChanged={handleUpdateCount}
        dot={
          <View
            style={applyStyles({
              width: 8,
              height: 8,
              marginLeft: 3,
              marginRight: 3,
              borderRadius: 4,
              backgroundColor: colors['gray-20'],
            })}
          />
        }
        activeDot={
          <View
            style={applyStyles({
              width: 24,
              height: 8,
              marginLeft: 3,
              marginRight: 3,
              borderRadius: 4,
              backgroundColor: colors['red-100'],
            })}
          />
        }>
        <View style={applyStyles('center flex-1')}>
          <Image
            style={applyStyles('mb-24', {width: 400, height: 200})}
            source={require('@/assets/images/hand.png')}
          />
          <Text
            style={applyStyles(
              'mb-8 px-16 text-center text-gray-300 text-700 text-2xl',
            )}>
            Get repaid before you get desperate
          </Text>
          <Text style={applyStyles('text-center text-gray-200 text-400')}>
            Get repayments from your customers 3X faster
          </Text>
        </View>
        <View style={applyStyles('center flex-1')}>
          <Image
            style={applyStyles('mb-24', {width: 400, height: 200})}
            source={require('@/assets/images/hand.png')}
          />
          <Text
            style={applyStyles(
              'mb-8 px-16 text-center text-gray-300 text-700 text-2xl',
            )}>
            Never forget to send reminders to your customers with our free
            reminders & notifications
          </Text>
          <Text style={applyStyles('text-center text-gray-200 text-400')}>
            Free SMS & WhatsApp reminders to your customers
          </Text>
        </View>
        <View style={applyStyles('flex-1 center')}>
          <Image
            style={applyStyles('mb-24', {width: 400, height: 200})}
            source={require('@/assets/images/hand.png')}
          />
          <Text
            style={applyStyles(
              'mb-8 px-16 text-center text-gray-300 text-700 text-2xl',
            )}>
            You and your business - as one
          </Text>
          <Text
            style={applyStyles('text-center text-gray-200 text-400 mx-auto', {
              width: 310,
              maxWidth: 280,
              lineHeight: 20,
            })}>
            Take control of your trade and bring it to the next level
          </Text>
        </View>
      </Swiper>
      <View
        style={applyStyles('w-full p-16 bg-white', {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.34,
          shadowRadius: 6.27,
          elevation: 10,
        })}>
        <View style={applyStyles('flex-row justify-between items-center')}>
          {count === 2 ? (
            <Button
              title="Get Started"
              variantColor="red"
              onPress={handleSkip}
              style={applyStyles('w-full')}
            />
          ) : (
            <>
              <Button
                title="Skip"
                onPress={handleSkip}
                variantColor="transparent"
                style={applyStyles({width: '48%'})}
              />
              <Button
                title="Next"
                variantColor="red"
                onPress={handleNext}
                style={applyStyles({width: '48%'})}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
};
