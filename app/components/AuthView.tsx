import {applyStyles, colors} from '@/styles';
import React, {ReactNode} from 'react';
import {ScrollView, Text, View, ViewStyle} from 'react-native';
import {Button} from './Button';

export type AuthViewProps = {
  title?: string;
  heading?: string;
  style?: ViewStyle;
  children: ReactNode;
  isLoading?: boolean;
  description?: string;
  buttonTitle?: string;
  showButton?: boolean;
  onSubmit?: (data?: any) => void;
};

export const AuthView = ({
  title,
  style,
  heading,
  onSubmit,
  children,
  isLoading,
  description,
  buttonTitle,
  showButton = true,
}: AuthViewProps) => {
  return (
    <>
      <View
        style={applyStyles('flex-row center bg-white pt-32 pb-24', {
          borderBottomWidth: 1,
          borderBottomColor: colors['gray-10'],
        })}>
        <Text style={applyStyles('text-400 text-uppercase text-gray-300')}>
          {title}
        </Text>
      </View>
      <ScrollView
        style={applyStyles('flex-1 py-32 bg-white')}
        keyboardShouldPersistTaps="always"
        persistentScrollbar={true}>
        <View style={applyStyles('mb-24 px-16 center')}>
          <Text
            style={applyStyles(
              'text-2xl pb-8 text-black heading-700 text-center',
            )}>
            {heading}
          </Text>
          <Text
            style={applyStyles(
              'text-base leading-28 text-gray-300 text-400 text-center',
            )}>
            {description}
          </Text>
        </View>
        <View style={applyStyles('px-16', style)}>{children}</View>
      </ScrollView>
      {showButton && (
        <View
          style={applyStyles('w-full p-16 bg-white', {
            position: 'absolute',
            bottom: 0,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,
            elevation: 10,
          })}>
          <Button
            variantColor="red"
            onPress={onSubmit}
            title={buttonTitle}
            isLoading={isLoading}
            style={applyStyles('w-full')}
          />
        </View>
      )}
    </>
  );
};
