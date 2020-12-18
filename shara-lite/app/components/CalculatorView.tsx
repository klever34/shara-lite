import React, {
  useCallback,
  ReactNode,
  useState,
  createContext,
  useContext,
} from 'react';
import {AppInput, AppInputProps} from '@/components/AppInput';
import {applyStyles} from '@/styles';
import {Text, View} from 'react-native';
import Icon from '@/components/Icon';
import {TransactionEntryButton} from '@/components/TransactionEntryView';
import {Keyboard} from 'react-native-ui-lib';
const KeyboardUtils = Keyboard.KeyboardUtils;
const KeyboardAccessoryView = Keyboard.KeyboardAccessoryView;
const KeyboardRegistry = Keyboard.KeyboardRegistry;

type CalculatorContextProps = {
  showKbComponent?: () => void;
  resetKbComponent?: () => void;
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
  return (
    <CalculatorContext.Provider value={{showKbComponent, resetKbComponent}}>
      {children}
      <KeyboardAccessoryView
        kbComponent={kbComponent}
        onItemSelected={(name: string, args: any) => {
          console.log(name, args);
          KeyboardUtils.dismiss();
        }}
        onRequestShowKeyboard={showKbComponent}
        onKeyboardResigned={resetKbComponent}
      />
    </CalculatorContext.Provider>
  );
}

enum CalculatorKeyboardActions {
  TYPE = 'TYPE',
  DELETE = 'DELETE',
  CLEAR = 'CLEAR',
  ANSWER = 'ANSWER',
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

  const handleClear = useCallback(() => {
    KeyboardRegistry.onItemSelected(CalculatorKeyboardName, {
      action: CalculatorKeyboardActions.CLEAR,
    });
  }, []);

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
    <View style={applyStyles('flex-1')}>
      <View style={applyStyles('flex-row flex-1')}>
        <TransactionEntryButton label="." onPress={enterValue('.')} />
        <TransactionEntryButton
          style={applyStyles('bg-gray-50', {flex: 2})}
          label="clear"
          onPress={handleClear}
        />
        <TransactionEntryButton
          onPress={handleDelete}
          style={applyStyles('bg-gray-50')}>
          <Icon type="feathericons" name="delete" size={24} />
        </TransactionEntryButton>
      </View>
      <View style={applyStyles('flex-row flex-1')}>
        <TransactionEntryButton label="7" onPress={enterValue('7')} />
        <TransactionEntryButton label="8" onPress={enterValue('8')} />
        <TransactionEntryButton label="9" onPress={enterValue('9')} />
        <TransactionEntryButton
          label="%"
          onPress={enterValue('%')}
          style={applyStyles('bg-gray-50')}
        />
      </View>
      <View style={applyStyles('flex-row flex-1')}>
        <TransactionEntryButton label="4" onPress={enterValue('4')} />
        <TransactionEntryButton label="5" onPress={enterValue('5')} />
        <TransactionEntryButton label="6" onPress={enterValue('6')} />
        <TransactionEntryButton
          label="÷"
          onPress={enterValue('÷')}
          style={applyStyles('bg-gray-50')}
        />
      </View>
      <View style={applyStyles('flex-row flex-1')}>
        <TransactionEntryButton label="1" onPress={enterValue('1')} />
        <TransactionEntryButton label="2" onPress={enterValue('2')} />
        <TransactionEntryButton label="3" onPress={enterValue('3')} />
        <TransactionEntryButton
          onPress={enterValue('*')}
          style={applyStyles('bg-gray-50')}>
          <Text>x</Text>
        </TransactionEntryButton>
      </View>
      <View style={applyStyles('flex-row flex-1')}>
        <TransactionEntryButton label="0" onPress={enterValue('0')} />
        <TransactionEntryButton label="00" onPress={enterValue('00')} />
        <TransactionEntryButton label="000" onPress={enterValue('000')} />
        <TransactionEntryButton label="=" onPress={handleCalculate} />
      </View>
      <View style={applyStyles('flex-row flex-1')}>
        <TransactionEntryButton
          label="-"
          onPress={enterValue('-')}
          style={applyStyles('bg-gray-50')}
        />
        <TransactionEntryButton
          label="+"
          onPress={enterValue('+')}
          style={applyStyles('bg-gray-50')}
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
  const {showKbComponent, resetKbComponent} = useContext(CalculatorContext);
  return (
    <>
      <AppInput
        {...props}
        onFocus={showKbComponent}
        onTouchStart={showKbComponent}
        onBlur={resetKbComponent}
        showSoftInputOnFocus={false}
      />
    </>
  );
};
