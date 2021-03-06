import {Header, HeaderTitleProps} from '@/components/Header';
import {applyStyles} from '@/styles';
import React, {ReactNode, useContext, useEffect, useState} from 'react';
import {Keyboard, View, ViewStyle} from 'react-native';
//@ts-ignore
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';

type PageProps = {
  header?: HeaderTitleProps;
  children?: ReactNode;
  footer?: ReactNode;
  forceShowFooter?: boolean;
  style?: ViewStyle;
};

export type PageContextProps = {setFooter?: (footer: ReactNode) => void};

export const PageContext = React.createContext<PageContextProps>({});

export const Page = ({
  header,
  children,
  footer: initialFooter = null,
  forceShowFooter = false,
  style,
}: PageProps) => {
  const [footer, setFooter] = useState<ReactNode>(initialFooter);

  useEffect(() => {
    if (initialFooter) {
      setFooter(initialFooter);
    }
  }, [initialFooter]);

  const [showFooter, setShowFooter] = useState(true);

  const keyboardDidShow = () => {
    setShowFooter(false);
  };

  const keyboardDidHide = () => {
    setShowFooter(true);
  };

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => {
      Keyboard.removeListener('keyboardDidShow', keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', keyboardDidHide);
    };
  }, []);

  return (
    <PageContext.Provider value={{setFooter}}>
      {header && <Header {...header} />}
      <KeyboardAwareScrollView
        nestedScrollEnabled
        persistentScrollbar={true}
        style={applyStyles('flex-1 bg-white')}
        keyboardShouldPersistTaps="always">
        <View style={applyStyles('px-16 py-16', style)}>{children}</View>
      </KeyboardAwareScrollView>
      {footer && (showFooter || forceShowFooter) && (
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
    </PageContext.Provider>
  );
};

export const usePage = () => {
  return useContext(PageContext);
};
