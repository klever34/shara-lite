import {HeaderTitleProps} from '@/components/Header';
import {Text} from '@/components';
import {applyStyles, colors} from '@/styles';
import React, {ReactNode} from 'react';
import {KeyboardAvoidingView, View, ViewStyle} from 'react-native';
import {HeaderBackButton} from './HeaderBackButton';
import {SecureEmblem} from './SecureEmblem';
import Markdown from 'react-native-markdown-display';

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
  showBackButton?: boolean;
};

export const AuthView = ({
  style,
  heading,
  children,
  description,
  showEmblem = true,
  showBackButton = false,
}: AuthViewProps) => {
  return (
    <KeyboardAvoidingView style={applyStyles('flex-1 bg-white px-16', style)}>
      {showBackButton && (
        <View style={applyStyles('pt-16')}>
          <HeaderBackButton />
        </View>
      )}
      <View style={applyStyles('mb-64 pt-48 center')}>
        <Text
          style={applyStyles('text-2xl pb-8 text-700 text-center', {
            color: colors['gray-300'],
          })}>
          {heading}
        </Text>
        <Markdown
          style={{
            textgroup: applyStyles(
              'text-400 text-center text-sm text-gray-300',
            ),
          }}>
          {description}
        </Markdown>
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
