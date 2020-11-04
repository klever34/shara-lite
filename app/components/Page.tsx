import {Header, HeaderTitleProps} from '@/components/Header';
import {applyStyles} from '@/styles';
import React, {ReactNode} from 'react';
import {View, ViewStyle} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

type PageProps = {
  header?: HeaderTitleProps;
  children?: ReactNode;
  footer?: ReactNode;
  style?: ViewStyle;
};

export const Page = ({header, children, footer, style}: PageProps) => {
  return (
    <>
      {header && <Header {...header} />}
      <KeyboardAwareScrollView
        enableAutomaticScroll
        enableResetScrollToCoords
        persistentScrollbar={true}
        keyboardShouldPersistTaps="always"
        resetScrollToCoords={{x: 0, y: 0}}
        style={applyStyles('flex-1 px-16 py-16', style)}>
        {children}
      </KeyboardAwareScrollView>
      {footer && (
        <View
          style={applyStyles('w-full p-16 bg-white', {
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
    </>
  );
};
