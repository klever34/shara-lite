import {applyStyles, colors} from '@/styles';
import React, {ReactNode} from 'react';
import {Image, ScrollView, Text, View, ViewStyle} from 'react-native';
import {Button} from './Button';
import {Header} from './Header';

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
  style,
  title,
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
      {!!title && <Header title={title} />}
      <ScrollView
        style={applyStyles('flex-1 py-32 bg-white')}
        keyboardShouldPersistTaps="always"
        persistentScrollbar={true}>
        <View style={applyStyles('mb-48 px-16 center')}>
          <Text
            style={applyStyles('text-2xl pb-8 text-700 text-center', {
              color: colors['gray-300'],
            })}>
            {heading}
          </Text>
          <Text
            style={applyStyles('text-400 text-center text-sm', {
              color: colors['gray-300'],
            })}>
            {description}
          </Text>
        </View>
        <View style={applyStyles('px-16', style)}>{children}</View>
        <View style={applyStyles('flex-row center', {paddingBottom: 400})}>
          <View
            style={applyStyles({
              width: '50%',
              height: '50%',
            })}>
            <Image
              resizeMode="contain"
              style={applyStyles('w-full h-full')}
              source={require('@/assets/images/emblem.png')}
            />
          </View>
        </View>
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
