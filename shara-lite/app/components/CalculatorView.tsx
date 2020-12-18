import React, {
  useCallback,
  ReactNode,
  useState,
  createContext,
  useContext,
  useEffect,
} from 'react';
import {AppInput, AppInputProps} from '@/components/AppInput';
import {applyStyles} from '@/styles';
import {View} from 'react-native';
import Icon from '@/components/Icon';
import {TransactionEntryButton} from '@/components/TransactionEntryView';
import {Keyboard} from 'react-native-ui-lib';
const KeyboardUtils = Keyboard.KeyboardUtils;
const KeyboardAccessoryView = Keyboard.KeyboardAccessoryView;
const KeyboardRegistry = Keyboard.KeyboardRegistry;

enum CalculatorKeyboardActions {
  TYPE = 'TYPE',
  DELETE = 'DELETE',
  CLEAR = 'CLEAR',
  ANSWER = 'ANSWER',
}

type CalculatorKeyboardItemSelectedEvent = {
  action: CalculatorKeyboardActions;
  value?: any;
};
type CalculatorKeyboardItemSelectedEventCallback = (
  event: CalculatorKeyboardItemSelectedEvent,
) => void;

type CalculatorContextProps = {
  showKbComponent?: () => void;
  resetKbComponent?: () => void;
  addEventListener?: (
    callback: CalculatorKeyboardItemSelectedEventCallback,
  ) => () => void;
};

const CalculatorContext = createContext<CalculatorContextProps>({});

type CalculatorViewProps = {
  children: ReactNode;
};

export function CalculatorView({children}: CalculatorViewProps) {
  const [kbComponent, setKbComponent] = useState<string | undefined>();
  const showKbComponent = useCallback(() => {
    setKbComponent(CalculatorKeyboardName);
  }, []);
  const resetKbComponent = useCallback(() => {
    setKbComponent(undefined);
  }, []);
  const [itemSelectedListeners, setItemSelectedListeners] = useState<
    CalculatorKeyboardItemSelectedEventCallback[]
  >([]);
  const addEventListener = useCallback(
    (callback: CalculatorKeyboardItemSelectedEventCallback) => {
      setItemSelectedListeners((prevItemSelectedListeners) => [
        ...prevItemSelectedListeners,
        callback,
      ]);
      return () => {
        setItemSelectedListeners((prevItemSelectedListeners) => {
          const index = prevItemSelectedListeners.findIndex(
            (cb) => cb === callback,
          );
          return [
            ...prevItemSelectedListeners.slice(0, index),
            ...prevItemSelectedListeners.slice(index + 1),
          ];
        });
      };
    },
    [],
  );
  const handleItemSelected = useCallback(
    (name: string, event: CalculatorKeyboardItemSelectedEvent) => {
      itemSelectedListeners.forEach((itemSelectedListener) => {
        itemSelectedListener(event);
      });
    },
    [itemSelectedListeners],
  );
  return (
    <CalculatorContext.Provider
      value={{showKbComponent, resetKbComponent, addEventListener}}>
      {children}
      <KeyboardAccessoryView
        kbComponent={kbComponent}
        onItemSelected={handleItemSelected}
        onRequestShowKeyboard={showKbComponent}
        onKeyboardResigned={resetKbComponent}
      />
    </CalculatorContext.Provider>
  );
}

export const CalculatorKeyboardName = 'CalculatorKeyboard';

const CalculatorKeyboard = () => {
  const enterValue = useCallback((value: string) => {
    return () => {
      KeyboardRegistry.onItemSelected(CalculatorKeyboardName, {
        action: CalculatorKeyboardActions.TYPE,
        value,
      });
    };
  }, []);

  // const handleClear = useCallback(() => {
  //   KeyboardRegistry.onItemSelected(CalculatorKeyboardName, {
  //     action: CalculatorKeyboardActions.CLEAR,
  //   });
  // }, []);

  const handleDelete = useCallback(() => {
    KeyboardRegistry.onItemSelected(CalculatorKeyboardName, {
      action: CalculatorKeyboardActions.DELETE,
    });
  }, []);

  const handleCalculate = useCallback(() => {
    KeyboardRegistry.onItemSelected(CalculatorKeyboardName, {
      action: CalculatorKeyboardActions.ANSWER,
    });
  }, []);

  return (
    <View style={applyStyles('flex-1 flex-row px-16')}>
      <View style={applyStyles('flex-1')}>
        <TransactionEntryButton onPress={handleDelete}>
          <Icon type="feathericons" name="delete" size={24} />
        </TransactionEntryButton>
        <TransactionEntryButton label="7" onPress={enterValue('7')} />
        <TransactionEntryButton label="4" onPress={enterValue('4')} />
        <TransactionEntryButton label="1" onPress={enterValue('1')} />
        <TransactionEntryButton label="00" onPress={enterValue('00')} />
      </View>
      <View style={applyStyles('flex-1')}>
        <TransactionEntryButton label="%" onPress={enterValue('%')} />
        <TransactionEntryButton label="8" onPress={enterValue('8')} />
        <TransactionEntryButton label="5" onPress={enterValue('5')} />
        <TransactionEntryButton label="2" onPress={enterValue('2')} />
        <TransactionEntryButton label="0" onPress={enterValue('0')} />
      </View>
      <View style={applyStyles('flex-1')}>
        <TransactionEntryButton
          label="÷"
          onPress={enterValue('÷')}
          textStyle={applyStyles('text-red-100')}
        />
        <TransactionEntryButton label="9" onPress={enterValue('9')} />
        <TransactionEntryButton label="6" onPress={enterValue('6')} />
        <TransactionEntryButton label="3" onPress={enterValue('3')} />
        <TransactionEntryButton label="." onPress={enterValue('.')} />
      </View>
      <View style={applyStyles('flex-1')}>
        <TransactionEntryButton
          label="x"
          onPress={enterValue('*')}
          textStyle={applyStyles('text-red-100')}
        />
        <TransactionEntryButton
          label="-"
          onPress={enterValue('-')}
          textStyle={applyStyles('text-red-100')}
        />
        <TransactionEntryButton
          label="+"
          onPress={enterValue('+')}
          textStyle={applyStyles('text-red-100')}
        />
        <TransactionEntryButton
          label="="
          onPress={handleCalculate}
          style={applyStyles('bg-red-200', {flex: 2.1})}
          textStyle={applyStyles('text-white')}
        />
      </View>
    </View>
  );
};

KeyboardRegistry.registerKeyboard(
  CalculatorKeyboardName,
  () => CalculatorKeyboard,
);

type CalculatorInputProps = AppInputProps & {};

export const CalculatorInput = (props: CalculatorInputProps) => {
  const {showKbComponent, resetKbComponent, addEventListener} = useContext(
    CalculatorContext,
  );
  useEffect(() => {
    if (addEventListener) {
      addEventListener((event) => {
        console.log('event', event); // event {"action": "ANSWER"}
        KeyboardUtils.dismiss();
      });
    }
  }, [addEventListener]);
  return (
    <AppInput
      {...props}
      onFocus={showKbComponent}
      onTouchStart={showKbComponent}
      onBlur={resetKbComponent}
      showSoftInputOnFocus={false}
    />
  );
};
