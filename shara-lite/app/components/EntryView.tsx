import {Text} from '@/components';
import {Icon} from '@/components/Icon';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {ICustomer} from '@/models';
import {getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react';
import {View, ViewStyle} from 'react-native';
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

    const onRequestPayment = useCallback(() => {
      const onSelectCustomer = (customer: ICustomer) => {
        navigation.navigate('RequestPayment', {
          customer,
          goBack: () => navigation.navigate('Home'),
        });
      };

      navigation.navigate('SelectCustomerList', {
        withCustomer: true,
        onSelectCustomer,
        isCollection: true,
      });
    }, [currentCustomer, navigation]);

    const showEntryDialog = useCallback(() => {
      const entryOptions = [
        {
          iconType: 'feathericons',
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
          iconType: 'feathericons',
          title: strings('collection.button.title'),
          description: strings('collection.button.description'),
          icon: 'arrow-down',
          onPress: onRecordCollection,
          color: {
            primary: colors['green-200'],
            pastel: colors['green-50'],
          },
        },
        {
          iconType: 'feathericons',
          title: strings('request_payment.button.title'),
          description: strings('request_payment.button.description'),
          icon: 'dollar-sign',
          onPress: onRequestPayment,
          color: {
            primary: colors['gray-300'],
            pastel: colors['gray-20'],
          },
        },
      ] as {
        icon: string;
        title: string;
        description: string;
        iconType:
          | 'ionicons'
          | 'octicons'
          | 'material-icons'
          | 'feathericons'
          | 'material-community-icons';
        onPress: () => void;
        color: {
          primary: string;
          pastel: string;
        };
      }[];
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
                            size={24}
                            name={icon}
                            type="feathericons"
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
  ghost?: boolean;
  style?: ViewStyle;
};

export const EntryButton = ({ghost, style}: EntryButtonProps) => {
  const {showEntryDialog} = useContext(EntryContext);

  return (
    <Touchable onPress={ghost ? undefined : showEntryDialog}>
      <View
        style={applyStyles(
          'w-60 h-60 my-12 rounded-32 center bg-secondary relative',
          style,
        )}>
        <Icon size={40} name="plus" type="feathericons" color={colors.white} />
      </View>
    </Touchable>
  );
};
