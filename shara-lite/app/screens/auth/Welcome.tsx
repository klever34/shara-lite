import OnboardingImage1 from '@/assets/images/onboarding_image_1.svg';
import OnboardingImage2 from '@/assets/images/onboarding_image_2.svg';
import OnboardingImage3 from '@/assets/images/onboarding_image_3.svg';
import {Button} from '@/components';
import {getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useRef, useState} from 'react';
import {Text} from '@/components';
import {View} from 'react-native';
import Swiper from 'react-native-swiper';

const strings = getI18nService().strings;

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
              backgroundColor: colors['gray-200'],
            })}
          />
        }>
        <View style={applyStyles('center flex-1')}>
          <OnboardingImage1 style={applyStyles('ml-32 mb-64')} />
          <Text
            style={applyStyles(
              'mb-8 px-16 text-center text-gray-300 text-700 text-2xl',
            )}>
            {strings('onboarding_copy_1.title')}
          </Text>
          <Text style={applyStyles('text-center text-gray-200 text-400')}>
            {strings('onboarding_copy_1.description')}
          </Text>
        </View>
        <View style={applyStyles('center flex-1 px-24')}>
          <OnboardingImage2 style={applyStyles('mb-64')} />
          <Text
            style={applyStyles(
              'mb-8 px-16 text-center text-gray-300 text-700 text-2xl',
            )}>
            {strings('onboarding_copy_2.title')}
          </Text>
          <Text style={applyStyles('text-center text-gray-200 text-400')}>
            {strings('onboarding_copy_2.description')}
          </Text>
        </View>
        <View style={applyStyles('flex-1 center px-16')}>
          <OnboardingImage3 style={applyStyles('mb-64')} />
          <Text
            style={applyStyles(
              'mb-8 px-16 text-center text-gray-300 text-700 text-2xl',
            )}>
            {strings('onboarding_copy_3.title')}
          </Text>
          <Text
            style={applyStyles('text-center text-gray-200 text-400 mx-auto', {
              width: 310,
              maxWidth: 280,
              lineHeight: 20,
            })}>
            {strings('onboarding_copy_3.description')}
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
              onPress={handleSkip}
              style={applyStyles('w-full')}
              title={strings('get_started')}
            />
          ) : (
            <>
              <Button
                title={strings('skip')}
                onPress={handleSkip}
                variantColor="transparent"
                style={applyStyles({width: '48%'})}
              />
              <Button
                title={strings('next')}
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
