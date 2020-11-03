import React, {ReactNode} from 'react';
import {KeyboardAvoidingView, ScrollView, View} from 'react-native';
import {Header, HeaderTitleProps} from '@/components/Header';
import {applyStyles} from '@/styles';

type PageProps = {
  header?: HeaderTitleProps;
  children?: ReactNode;
  footer?: ReactNode;
};

export const Page = ({header, children, footer}: PageProps) => {
  return (
    <KeyboardAvoidingView style={applyStyles('flex-1')}>
      {header && <Header {...header} />}
      <ScrollView
        style={applyStyles('flex-1 py-32 bg-white')}
        keyboardShouldPersistTaps="always"
        persistentScrollbar={true}>
        {children}
      </ScrollView>
      {footer && (
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
          {footer}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};
