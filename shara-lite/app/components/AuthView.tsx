import {HeaderTitleProps} from '@/components/Header';
import {applyStyles, colors} from '@/styles';
import React, {ReactNode} from 'react';
import {KeyboardAvoidingView, Text, View, ViewStyle} from 'react-native';
import {SecureEmblem} from './SecureEmblem';

export type AuthViewProps = {
  header?: HeaderTitleProps;
  heading?: string;
  style?: ViewStyle;
  children: ReactNode;
  isLoading?: boolean;
  description?: string;
  buttonTitle?: string;
  showButton?: boolean;
  showEmblem?: boolean;
  onSubmit?: () => void;
};

export const AuthView = ({
  style,
  heading,
  children,
  description,
  showEmblem = true,
}: AuthViewProps) => {
  return (
    <KeyboardAvoidingView style={applyStyles('flex-1 bg-white px-16', style)}>
      <View style={applyStyles('mb-64 pt-48 center')}>
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
      {children}
      {showEmblem && (
        <View style={applyStyles('flex-row center pt-24')}>
          <SecureEmblem />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};
