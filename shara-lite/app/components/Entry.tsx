import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useRef,
  useState,
  useEffect,
} from 'react';
import {View, ViewProps} from 'react-native';
import {applyStyles} from '@/styles';
import {HeaderBackButton} from '@react-navigation/stack';
import Keypad from '@/assets/images/keypad.svg';
import Touchable from './Touchable';

type EntryContextProps = {
  showEntryDialog?: () => void;
  hideEntryDialog?: () => void;
  setEntryButtonPosition?: Dispatch<SetStateAction<{x: number; y: number}>>;
};

export const EntryContext = createContext<EntryContextProps>({});

type EntryProps = {
  children: ReactNode;
};

export const Entry = ({children}: EntryProps) => {
  const [show, setShow] = useState(false);
  const hideEntryDialog = useCallback(() => {
    setShow(false);
  }, []);
  const showEntryDialog = useCallback(() => {
    setShow(true);
    return hideEntryDialog;
  }, [hideEntryDialog]);
  const [entryButtonPosition, setEntryButtonPosition] = useState({x: 0, y: 0});
  return (
    <EntryContext.Provider
      value={{showEntryDialog, hideEntryDialog, setEntryButtonPosition}}>
      {show && (
        <View
          style={applyStyles('w-screen h-screen absolute', {
            zIndex: 10,
          })}>
          <Touchable onPress={hideEntryDialog}>
            <View
              style={applyStyles('w-full h-full absolute', {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 0,
              })}
            />
          </Touchable>
          <EntryButton
            container={{
              style: applyStyles('relative', {
                zIndex: 10,
                top: entryButtonPosition.y,
                left: entryButtonPosition.x,
              }),
            }}
          />
        </View>
      )}
      {children}
    </EntryContext.Provider>
  );
};

type EntryButtonProps = {
  container?: ViewProps;
  onLayout?: (position: {x: number; y: number}) => void;
  onPress?: () => void;
};

export const EntryButton = ({
  container,
  onLayout,
  onPress,
}: EntryButtonProps) => {
  const containerRef = useRef<View | null>(null);
  const nextOnLayout = useRef(onLayout).current;
  useEffect(() => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current?.measure?.((fx, fy, width, height, px, py) => {
          nextOnLayout?.({x: px, y: py});
        });
      }
    }, 0);
  }, [nextOnLayout]);
  return (
    <View
      style={applyStyles('relative', {zIndex: 20, opacity: 1})}
      {...container}
      ref={containerRef}>
      <HeaderBackButton
        backImage={() => {
          return (
            <View
              style={applyStyles(
                'w-60 h-60 my-12 rounded-32 center bg-primary relative',
              )}>
              <Keypad width={24} height={24} />
            </View>
          );
        }}
        onPress={onPress}
      />
    </View>
  );
};
