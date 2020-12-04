import {Header, HeaderTitleProps} from '@/components/Header';
import {applyStyles} from '@/styles';
import React, {ReactNode, useContext, useEffect, useState} from 'react';
import {View, ViewStyle} from 'react-native';
//@ts-ignore
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import {Footer} from './Footer';

type PageProps = {
  header?: HeaderTitleProps;
  children?: ReactNode;
  footer?: ReactNode;
  style?: ViewStyle;
};

export type PageContextProps = {setFooter?: (footer: ReactNode) => void};

export const PageContext = React.createContext<PageContextProps>({});

export const Page = ({
  header,
  children,
  footer: initialFooter = null,
  style,
}: PageProps) => {
  const [footer, setFooter] = useState<ReactNode>(initialFooter);

  useEffect(() => {
    if (initialFooter) {
      setFooter(initialFooter);
    }
  }, [initialFooter]);

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
      {footer && <Footer>{footer}</Footer>}
    </PageContext.Provider>
  );
};

export const usePage = () => {
  return useContext(PageContext);
};
