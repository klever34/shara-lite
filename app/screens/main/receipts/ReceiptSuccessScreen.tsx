import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {applyStyles} from '@/styles';
import LottieView from 'lottie-react-native';
import React, {useEffect} from 'react';
import {Text, View} from 'react-native';

export const ReceiptSuccessScreen = ({route}: any) => {
  const realm = useRealm();
  const navigation = useAppNavigation();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const receiptId = route.params.id;
      navigation.navigate('ReceiptDetails', {id: receiptId});
    }, 1000);
    return () => clearTimeout(timeout);
  }, [realm, navigation, route.params.id]);

  return (
    <View style={applyStyles('bg-white center flex-1')}>
      <View style={applyStyles({width: 300, height: 300})}>
        <LottieView
          autoPlay
          source={require('@/assets/animations/success.json')}
        />
      </View>
      <Text style={applyStyles('text-gray-300 text-400 text-xl text-center')}>
        Receipt created successfully
      </Text>
    </View>
  );
};
