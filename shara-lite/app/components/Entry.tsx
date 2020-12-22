import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useRef,
  useState,
  useLayoutEffect,
  useContext,
} from 'react';
import {
  findNodeHandle,
  SafeAreaView,
  Text,
  View,
  ViewProps,
} from 'react-native';
import {applyStyles, colors} from '@/styles';
import {HeaderBackButton} from '@react-navigation/stack';
import Keypad from '@/assets/images/keypad.svg';
import Touchable from './Touchable';
import {Icon} from './Icon';
import * as Animatable from 'react-native-animatable';
import {useAppNavigation} from '@/services/navigation';
import {ICustomer} from '@/models';

type EntryContextProps = {
  wrapper?: View | null;
  showEntryDialog?: () => void;
  hideEntryDialog?: () => void;
  setEntryButtonPosition?: Dispatch<SetStateAction<{x: number; y: number}>>;
};

export const EntryContext = createContext<EntryContextProps>({});

type EntryProps = {
  children: ReactNode;
  onRecordSale?: () => void;
  onRecordCollection?: () => void;
};

export const Entry = ({
  children,
  onRecordSale,
  onRecordCollection,
}: EntryProps) => {
  const [show, setShow] = useState(false);
  const hideEntryDialog = useCallback(() => {
    setShow(false);
  }, []);
  const showEntryDialog = useCallback(() => {
    setShow(true);
    return hideEntryDialog;
  }, [hideEntryDialog]);
  const [entryButtonPosition, setEntryButtonPosition] = useState({x: 0, y: 0});
  const navigation = useAppNavigation();
  const wrapperRef = useRef<View | null>(null);
  const wrapper = wrapperRef.current;

  onRecordSale =
    onRecordSale ??
    useCallback(() => {
      navigation.navigate('RecordSale', {
        goBack: () => navigation.navigate('Home'),
      });
    }, [navigation]);

  onRecordCollection =
    onRecordCollection ??
    useCallback(() => {
      navigation.navigate('SelectCustomerList', {
        withCustomer: true,
        onSelectCustomer: (customer: ICustomer) => {
          navigation.replace('RecordCollection', {
            customer,
            goBack: () => navigation.navigate('Home'),
          });
        },
      });
    }, [navigation]);

  return (
    <EntryContext.Provider
      value={{
        showEntryDialog,
        hideEntryDialog,
        setEntryButtonPosition,
        wrapper,
      }}>
      <SafeAreaView style={applyStyles('flex-1')} ref={wrapperRef}>
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
            <View
              style={applyStyles('absolute items-center w-full', {
                zIndex: 10,
                top: entryButtonPosition.y - 108,
              })}>
              <Touchable
                onPress={() => {
                  onRecordSale && onRecordSale();
                  hideEntryDialog();
                }}>
                <Animatable.View
                  animation="fadeInUp"
                  duration={300}
                  delay={10}
                  style={applyStyles(
                    'flex-row p-8 bg-red-200 center rounded-24',
                  )}>
                  <Icon
                    type="feathericons"
                    name="arrow-up"
                    color={colors.white}
                    size={20}
                  />
                  <Text
                    style={applyStyles(
                      'mx-8 text-700 font-bold text-xs text-white',
                    )}>
                    Record Sale
                  </Text>
                </Animatable.View>
              </Touchable>
            </View>
            <View
              style={applyStyles('absolute items-center w-full', {
                zIndex: 10,
                top: entryButtonPosition.y - 48,
              })}>
              <Touchable
                onPress={() => {
                  onRecordCollection && onRecordCollection();
                  hideEntryDialog();
                }}>
                <Animatable.View
                  animation="fadeInUp"
                  duration={300}
                  style={applyStyles(
                    'flex-row p-8 bg-green-200 center rounded-24',
                  )}>
                  <Icon
                    type="feathericons"
                    name="arrow-down"
                    color={colors.white}
                    size={20}
                  />
                  <Text
                    style={applyStyles(
                      'mx-8 text-700 font-bold text-xs text-white',
                    )}>
                    Record Collection
                  </Text>
                </Animatable.View>
              </Touchable>
            </View>
            <EntryButton
              ghost
              container={{
                style: applyStyles('absolute', {
                  zIndex: 10,
                  top: entryButtonPosition.y,
                  left: entryButtonPosition.x,
                }),
              }}
            />
          </View>
        )}
        {children}
      </SafeAreaView>
    </EntryContext.Provider>
  );
};

type EntryButtonProps = {
  container?: ViewProps;
  ghost?: boolean;
};

export const EntryButton = ({container, ghost}: EntryButtonProps) => {
  const containerRef = useRef<View | null>(null);
  const {wrapper, setEntryButtonPosition, showEntryDialog} = useContext(
    EntryContext,
  );
  useLayoutEffect(() => {
    if (!ghost) {
      setTimeout(() => {
        if (containerRef.current && wrapper) {
          containerRef.current.measureLayout(
            findNodeHandle(wrapper) as number,
            (x, y) => {
              setEntryButtonPosition?.({x, y});
            },
            () => {},
          );
        }
      }, 0);
    }
  }, [ghost, setEntryButtonPosition, wrapper]);
  return (
    <View
      style={applyStyles('relative', {
        zIndex: 20,
        opacity: 1,
        bottom: 6,
      })}
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
        onPress={ghost ? undefined : showEntryDialog}
      />
    </View>
  );
};
