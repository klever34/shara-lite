import {applyStyles, colors} from '@/styles';
import React, {ReactNode} from 'react';
import {Image, Text, View, ViewStyle} from 'react-native';
import {Button} from './Button';
import {Page} from './Page';

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
    <Page
      style={style}
      header={title ? {title} : undefined}
      footer={
        showButton ? (
          <Button
            variantColor="red"
            onPress={onSubmit}
            title={buttonTitle}
            isLoading={isLoading}
            style={applyStyles('w-full')}
          />
        ) : undefined
      }>
      <View style={applyStyles('mb-32 px-16 pt-24 center')}>
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
      <View style={applyStyles('px-16')}>{children}</View>
      <View style={applyStyles('flex-row center')}>
        <View
          style={applyStyles({
            top: -40,
            width: '20%',
          })}>
          <Image
            resizeMode="contain"
            style={applyStyles('w-full')}
            source={require('@/assets/images/emblem.png')}
          />
        </View>
      </View>
    </Page>
  );
};
