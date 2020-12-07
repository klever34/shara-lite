import React, {ReactNode} from 'react';
import {ScrollView, Text, View, ViewStyle} from 'react-native';
import Touchable from 'app-v1/components/Touchable';
import {applyStyles} from 'app-v1/helpers/utils';
import Icon from 'app-v1/components/Icon';
import {useNavigation} from '@react-navigation/native';

export type AuthViewProps = {
  title: string;
  description?: string;
  style?: ViewStyle;
  children: ReactNode;
};

export const AuthView = ({
  title,
  description,
  style,
  children,
}: AuthViewProps) => {
  const navigation = useNavigation();
  return (
    <ScrollView
      style={applyStyles('flex-1 py-32')}
      keyboardShouldPersistTaps="always"
      persistentScrollbar={true}>
      <View style={applyStyles('mb-32')}>
        <Touchable onPress={() => navigation.goBack()}>
          <View style={applyStyles('h-48 w-48 center ml-16')}>
            <Icon size={24} type="feathericons" name="arrow-left" />
          </View>
        </Touchable>
      </View>
      <View style={applyStyles('mb-48 px-32')}>
        <Text style={applyStyles('text-2xl pb-8 text-black heading-700')}>
          {title}
        </Text>
        <Text
          style={applyStyles(
            'text-base leading-28 pb-8 text-gray-300 text-400',
          )}>
          {description}
        </Text>
      </View>
      <View style={applyStyles('px-32', style)}>{children}</View>
    </ScrollView>
  );
};
