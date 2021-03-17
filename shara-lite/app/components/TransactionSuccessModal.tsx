import React from 'react';
import {View} from 'react-native';
import {applyStyles} from '@/styles';
import LottieView from 'lottie-react-native';
import {Text} from '@/components/Text';
import {Button} from '@/components/Button';
import {getI18nService} from '@/services';
import Markdown from 'react-native-markdown-display';

const strings = getI18nService().strings;

type TransactionSuccessModalProps = {
  showAnimation?: boolean;
  heading?: string;
  subheading?: string;
  onDone: () => void;
};

export const TransactionSuccessModal = ({
  showAnimation = true,
  heading = 'Success',
  subheading,
  onDone,
}: TransactionSuccessModalProps) => {
  return (
    <View style={applyStyles('items-center flex-1 px-24 py-32')}>
      <View style={applyStyles('pb-32 center flex-1')}>
        {!!showAnimation && (
          <View style={applyStyles('pb-8')}>
            <LottieView
              autoPlay
              style={applyStyles({width: 50})}
              source={require('@/assets/animations/success.json')}
            />
          </View>
        )}
        <Text style={applyStyles('text-black text-400 text-2xl text-center')}>
          {heading}
        </Text>
        <Markdown
          style={{
            text: applyStyles('text-gray-200 text-400 text-base'),
            textgroup: applyStyles('text-center'),
          }}>
          {subheading}
        </Markdown>
      </View>
      <Button
        title={strings('done')}
        onPress={onDone}
        style={applyStyles({width: '48%'})}
      />
    </View>
  );
};
