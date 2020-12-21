import React from 'react';
import {applyStyles} from '@/styles';
import {Text, View, ViewStyle} from 'react-native';

type TitleProps = {
  title: string;
  description: string;
  containerStyle?: ViewStyle;
};

export const TitleContainer = ({
  title,
  description,
  containerStyle,
}: TitleProps) => {
  return (
    <View style={applyStyles('', containerStyle)}>
      <Text style={applyStyles('text-xl text-400 text-gray-300')}>{title}</Text>
      <Text style={applyStyles('text-sm text-gray-200 mt-4')}>
        {description}
      </Text>
    </View>
  );
};
