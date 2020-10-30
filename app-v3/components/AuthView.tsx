import React, {ReactNode} from 'react';
import {ScrollView, Text, View, ViewStyle} from 'react-native';
import Touchable from 'app-v3/components/Touchable';
import Icon from 'app-v3/components/Icon';
import {useNavigation} from '@react-navigation/native';
import {colors} from 'app-v3/styles';
import {applyStyles} from 'app-v3/styles';

export type AuthViewProps = {
  title: string;
  style?: ViewStyle;
  children: ReactNode;
  description?: string;
  showBackButton?: boolean;
};

export const AuthView = ({
  title,
  style,
  children,
  description,
  showBackButton = true,
}: AuthViewProps) => {
  const navigation = useNavigation();
  return (
    <ScrollView
      style={applyStyles('flex-1 py-32', {backgroundColor: colors.white})}
      keyboardShouldPersistTaps="always"
      persistentScrollbar={true}>
      {showBackButton && (
        <View style={applyStyles('mb-32')}>
          <Touchable onPress={() => navigation.goBack()}>
            <View style={applyStyles('h-48 w-48 center ml-16')}>
              <Icon size={24} type="feathericons" name="arrow-left" />
            </View>
          </Touchable>
        </View>
      )}
      <View style={applyStyles('mb-24 px-32')}>
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
