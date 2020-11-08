import {Header, HeaderTitleProps} from '@/components/Header';
import {applyStyles} from '@/styles';
import React, {ReactNode, useContext, useState} from 'react';
import {View, ViewStyle} from 'react-native';
//@ts-ignore
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';

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

  return (
    <PageContext.Provider value={{setFooter}}>
      {header && <Header {...header} />}
      <KeyboardAwareScrollView
        persistentScrollbar={true}
        keyboardShouldPersistTaps="always"
        style={applyStyles('px-16 py-16', style)}>
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
    </PageContext.Provider>
  );
};

export const usePage = () => {
  return useContext(PageContext);
};
