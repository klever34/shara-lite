import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useRef,
  useState,
  useContext,
} from 'react';
import {Text} from '@/components';
import {View, ViewProps} from 'react-native';
import {applyStyles, colors} from '@/styles';
import {HeaderBackButton} from '@react-navigation/stack';
import {useAppNavigation} from '@/services/navigation';
import {ICustomer} from '@/models';
import {getI18nService} from '@/services';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {Icon} from '@/components/Icon';
import {Touchable} from './Touchable';

const strings = getI18nService().strings;

type EntryContextProps = {
  wrapper?: View | null;
  showEntryDialog?: () => void;
  hideEntryDialog?: () => void;
  setEntryButtonPosition?: Dispatch<SetStateAction<{x: number; y: number}>>;
  setCurrentCustomer?: Dispatch<SetStateAction<ICustomer | null>>;
};

export const EntryContext = createContext<EntryContextProps>({});

type EntryViewProps = {
  children: ReactNode;
};

export const EntryView = withModal(
  ({
    children,
    openModal,
    closeModal: hideEntryDialog,
  }: EntryViewProps & ModalWrapperFields) => {
    const navigation = useAppNavigation();
    const [currentCustomer, setCurrentCustomer] = useState<ICustomer | null>(
      null,
    );

    const onRecordSale = useCallback(() => {
      navigation.navigate('RecordSale', {
        goBack: () => navigation.navigate('Home'),
        customer: currentCustomer,
      });
    }, [currentCustomer, navigation]);

    const onRecordCollection = useCallback(() => {
      const onSelectCustomer = (customer: ICustomer) => {
        navigation.navigate('RecordCollection', {
          customer,
          goBack: () => navigation.navigate('Home'),
        });
      };
      if (currentCustomer) {
        onSelectCustomer(currentCustomer);
      } else {
        navigation.navigate('SelectCustomerList', {
          withCustomer: true,
          onSelectCustomer,
          isCollection: true,
        });
      }
    }, [currentCustomer, navigation]);

    const showEntryDialog = useCallback(() => {
      const entryOptions = [
        {
          title: strings('sale.button.title'),
          description: strings('sale.button.description'),
          icon: 'dollar-sign',
          onPress: onRecordSale,
          color: {
            primary: colors['blue-100'],
            pastel: colors['blue-10'],
          },
        },
        {
          title: strings('collection.button.title'),
          description: strings('collection.button.description'),
          icon: 'arrow-down',
          onPress: onRecordCollection,
          color: {
            primary: colors['green-200'],
            pastel: colors['green-50'],
          },
        },
      ];
      return openModal('bottom-half', {
        renderContent: () => {
          return (
            <View style={applyStyles('mb-32')}>
              {entryOptions.map(
                ({icon, title, description, onPress, color}, index, array) => {
                  return (
                    <Touchable
                      key={index.toString()}
                      onPress={() => {
                        onPress();
                        hideEntryDialog();
                      }}>
                      <View
                        key={title}
                        style={applyStyles('flex-row mx-16 pt-16 items-start')}>
                        <View
                          style={applyStyles(
                            'rounded-24 bg-gray-20 mr-12 w-32 h-32 center',
                            {
                              backgroundColor: color.pastel,
                            },
                          )}>
                          <Icon
                            type="feathericons"
                            name={icon}
                            size={24}
                            color={color.primary}
                          />
                        </View>
                        <View
                          style={applyStyles(
                            'pb-16 flex-1',
                            index !== array.length - 1 &&
                              'border-b-4 border-gray-20',
                          )}>
                          <Text
                            style={applyStyles('text-700 text-lg', {
                              color: color.primary,
                            })}>
                            {title}
                          </Text>
                          <Text style={applyStyles('text-400 text-sm')}>
                            {description}
                          </Text>
                        </View>
                      </View>
                    </Touchable>
                  );
                },
              )}
            </View>
          );
        },
      });
    }, [hideEntryDialog, onRecordCollection, onRecordSale, openModal]);

    return (
      <EntryContext.Provider
        value={{
          showEntryDialog,
          setCurrentCustomer,
        }}>
        {children}
      </EntryContext.Provider>
    );
  },
);

type EntryButtonProps = {
  container?: ViewProps;
  ghost?: boolean;
};

export const EntryButton = ({container, ghost}: EntryButtonProps) => {
  const containerRef = useRef<View | null>(null);
  const {showEntryDialog} = useContext(EntryContext);

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
        labelVisible={false}
        backImage={() => {
          return (
            <View
              style={applyStyles(
                'w-60 h-60 my-12 rounded-32 center bg-secondary relative',
              )}>
              <Icon
                size={40}
                name="plus"
                type="feathericons"
                color={colors.white}
              />
            </View>
          );
        }}
        onPress={ghost ? undefined : showEntryDialog}
      />
    </View>
  );
};
