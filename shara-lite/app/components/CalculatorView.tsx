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
import {TransactionEntryButton} from '@/components/TransactionEntryView';
import {Keyboard} from 'react-native-ui-lib';
import {View, ScrollView, Text} from 'react-native';
import {numberWithCommas} from '@/helpers/utils';
// const KeyboardUtils = Keyboard.KeyboardUtils;
const KeyboardAccessoryView = Keyboard.KeyboardAccessoryView;
const KeyboardRegistry = Keyboard.KeyboardRegistry;

enum CalculatorKeyboardActions {
  TYPE = 'TYPE',
  // DELETE = 'DELETE',
  CLEAR = 'CLEAR',
  ANSWER = 'ANSWER',
}

type CalculatorKeyboardItemSelectedEvent = {
  action: CalculatorKeyboardActions;
  value?: any;
};
type CalculatorKeyboardItemSelectedEventCallback = (value: number) => void;

type CalculatorContextProps = {
  showKbComponent?: () => void;
  resetKbComponent?: () => void;
  addEventListener?: (
    callback: CalculatorKeyboardItemSelectedEventCallback,
  ) => () => void;
  enterValue?: (value: string) => () => void;
  handleClear?: () => void;
  handleDelete?: () => void;
  handleCalculate?: () => void;
};

const CalculatorContext = createContext<CalculatorContextProps>({});

const getLastToken = (tokens: string[]) => {
  return tokens[tokens.length - 1];
};

const trimZeros = (nextToken: string) => {
  return nextToken.replace(/^0+/, '') || '0';
};

const createEnumerator = (tokens: string[]) => {
  let counter = -1;
  return {
    moveNext: function () {
      counter++;
      return counter < tokens.length;
    },
    getCurrent: function () {
      return tokens[counter];
    },
  };
};

const calculate = (tokens: string[]) => {
  console.log(tokens.length);
  const tokensEnumerator = createEnumerator(tokens);
  const stack: number[] = [];
  let lookahead = tokensEnumerator.moveNext()
    ? tokensEnumerator.getCurrent()
    : '</>';
  const syntaxError = new Error('Syntax Error');
  const mathError = new Error('Math Error');

  const match = (token: string) => {
    console.log('match');
    if (lookahead === token) {
      lookahead = tokensEnumerator.moveNext()
        ? tokensEnumerator.getCurrent()
        : '</>';
    } else {
      throw syntaxError;
    }
  };

  const solveBinary = (operator: string) => {
    const secondOperand = stack.pop() as number;
    const firstOperand = stack.pop() as number;
    let result;
    switch (operator) {
      case '+':
        result = firstOperand + secondOperand;
        break;
      case '-':
        result = firstOperand - secondOperand;
        break;
      case '*':
        result = firstOperand * secondOperand;
        break;
      case '÷':
        result = firstOperand / secondOperand;
        break;
      default:
        throw 'Invalid Operator';
    }
    if (isFinite(result)) {
      stack.push(result);
    } else {
      throw mathError;
    }
  };

  const solveUnary = (operator: string) => {
    const operand = stack.pop() as number;
    let result;
    switch (operator) {
      case '%':
        result = operand / 100;
        break;
      default:
        throw 'Invalid Operator';
    }
    if (isFinite(result)) {
      stack.push(result);
    } else {
      throw mathError;
    }
  };

  const term = () => {
    if (!isNaN(parseFloat(lookahead))) {
      stack.push(parseFloat(lookahead));
      match(lookahead);
    } else {
      throw syntaxError;
    }

    while (true) {
      if (lookahead === '%') {
        match('%');
        solveUnary('%');
      } else {
        return;
      }
    }
  };

  const expr = () => {
    term();
    while (true) {
      if (lookahead === '+') {
        match('+');
        term();
        solveBinary('+');
      } else if (lookahead === '-') {
        match('-');
        term();
        solveBinary('-');
      } else if (lookahead === '*') {
        match('*');
        term();
        solveBinary('*');
      } else if (lookahead === '÷') {
        match('÷');
        term();
        solveBinary('÷');
      } else {
        return;
      }
    }
  };

  try {
    expr();
    if (stack.length === 1 && lookahead === '</>') {
      return stack.pop();
    }
    throw syntaxError;
  } catch (err) {
    throw err;
  }
};

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
  const [
    ,
    // valueChangeListeners,
    setValueChangeListeners,
  ] = useState<CalculatorKeyboardItemSelectedEventCallback[]>([]);
  const addEventListener = useCallback(
    (callback: CalculatorKeyboardItemSelectedEventCallback) => {
      setValueChangeListeners((prevValueChangeListeners) => [
        ...prevValueChangeListeners,
        callback,
      ]);
      return () => {
        setValueChangeListeners((prevValueChangeListeners) => {
          const index = prevValueChangeListeners.findIndex(
            (cb) => cb === callback,
          );
          return [
            ...prevValueChangeListeners.slice(0, index),
            ...prevValueChangeListeners.slice(index + 1),
          ];
        });
      };
    },
    [],
  );

  const [tokens, setTokens] = useState<string[]>(['0']);

  const [amount, setAmount] = useState({
    label: '0',
    value: 0,
  });

  const enterValue = useCallback(
    (value: string) => {
      return () => {
        setTokens?.((prevTokens) => {
          const lastToken = getLastToken(prevTokens);
          if (
            (!isNaN(parseInt(value, 10)) || value === '.') &&
            !isNaN(parseInt(lastToken, 10))
          ) {
            if (lastToken.includes('.') && value === '.') {
              return prevTokens;
            }
            let nextToken;
            nextToken = lastToken + value;
            return [
              ...prevTokens.slice(0, prevTokens.length - 1),
              trimZeros(nextToken),
            ];
          } else {
            return [...prevTokens, trimZeros(value)];
          }
        });
      };
    },
    [setTokens],
  );

  const handleClear = useCallback(() => {
    setTokens?.(['0']);
  }, [setTokens]);

  const handleDelete = useCallback(() => {
    const lastToken = getLastToken(tokens as string[]);
    if (lastToken.length === 1) {
      if (tokens?.length === 1) {
        setTokens?.(['0']);
      } else {
        setTokens?.((prevTokens) => {
          return [...prevTokens.slice(0, prevTokens.length - 1)];
        });
      }
    } else {
      setTokens?.((prevTokens) => {
        return [
          ...prevTokens.slice(0, prevTokens.length - 1),
          lastToken.slice(0, lastToken.length - 1),
        ];
      });
    }
  }, [setTokens, tokens]);

  const handleCalculate = useCallback(() => {
    try {
      const result = calculate(tokens as string[]) as number;
      setAmount?.({
        label: numberWithCommas(result),
        value: result,
      });
    } catch (e) {
      setAmount?.(() => {
        return {
          label:
            tokens?.reduce((acc, curr) => {
              return acc + curr;
            }, '') ?? '',
          value: 0,
        };
      });
    }
  }, [setAmount, tokens]);

  const handleItemSelected = (
    name: string,
    event: CalculatorKeyboardItemSelectedEvent,
  ) => {
    switch (event.action) {
      case CalculatorKeyboardActions.TYPE:
        const value = event.value;
        setTokens((prevTokens) => {
          const lastToken = getLastToken(prevTokens);
          if (
            (!isNaN(parseInt(value, 10)) || value === '.') &&
            !isNaN(parseInt(lastToken, 10))
          ) {
            if (lastToken.includes('.') && value === '.') {
              return prevTokens;
            }
            let nextToken;
            nextToken = lastToken + value;
            return [
              ...prevTokens.slice(0, prevTokens.length - 1),
              trimZeros(nextToken),
            ];
          } else {
            return [...prevTokens, trimZeros(value)];
          }
        });
        break;
      case CalculatorKeyboardActions.CLEAR:
        setTokens(['0']);
        break;
      case CalculatorKeyboardActions.ANSWER:
        try {
          const result = calculate(tokens as string[]) as number;
          setAmount?.({
            label: numberWithCommas(result),
            value: result,
          });
        } catch (e) {
          setAmount?.(() => {
            return {
              label:
                tokens?.reduce((acc, curr) => {
                  return acc + curr;
                }, '') ?? '',
              value: 0,
            };
          });
        }
        break;
    }
  };

  return (
    <CalculatorContext.Provider
      value={{
        showKbComponent,
        resetKbComponent,
        addEventListener,
        enterValue,
        handleClear,
        handleDelete,
        handleCalculate,
      }}>
      {children}
      <KeyboardAccessoryView
        renderContent={() => <Text>{amount.label}</Text>}
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
  const {enterValue, handleClear, handleCalculate} = useContext(
    CalculatorContext,
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={applyStyles('w-screen')}
      keyboardShouldPersistTaps="always">
      <View style={applyStyles('flex-1 flex-row px-16')}>
        <View style={applyStyles('flex-1')}>
          <TransactionEntryButton label="C" onPress={handleClear} />
          <TransactionEntryButton label="7" onPress={enterValue?.('7')} />
          <TransactionEntryButton label="4" onPress={enterValue?.('4')} />
          <TransactionEntryButton label="1" onPress={enterValue?.('1')} />
          <TransactionEntryButton label="00" onPress={enterValue?.('00')} />
        </View>
        <View style={applyStyles('flex-1')}>
          <TransactionEntryButton label="%" onPress={enterValue?.('%')} />
          <TransactionEntryButton label="8" onPress={enterValue?.('8')} />
          <TransactionEntryButton label="5" onPress={enterValue?.('5')} />
          <TransactionEntryButton label="2" onPress={enterValue?.('2')} />
          <TransactionEntryButton label="0" onPress={enterValue?.('0')} />
        </View>
        <View style={applyStyles('flex-1')}>
          <TransactionEntryButton
            label="÷"
            onPress={enterValue?.('÷')}
            textStyle={applyStyles('text-red-100')}
          />
          <TransactionEntryButton label="9" onPress={enterValue?.('9')} />
          <TransactionEntryButton label="6" onPress={enterValue?.('6')} />
          <TransactionEntryButton label="3" onPress={enterValue?.('3')} />
          <TransactionEntryButton label="." onPress={enterValue?.('.')} />
        </View>
        <View style={applyStyles('flex-1')}>
          <TransactionEntryButton
            label="x"
            onPress={enterValue?.('*')}
            textStyle={applyStyles('text-red-100')}
          />
          <TransactionEntryButton
            label="-"
            onPress={enterValue?.('-')}
            textStyle={applyStyles('text-red-100')}
          />
          <TransactionEntryButton
            label="+"
            onPress={enterValue?.('+')}
            textStyle={applyStyles('text-red-100')}
          />
          <TransactionEntryButton
            label="="
            onPress={handleCalculate}
            style={applyStyles('bg-red-200', {flex: 2.2})}
            textStyle={applyStyles('text-white')}
          />
        </View>
      </View>
    </ScrollView>
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
      return addEventListener((value) => {
        console.log(value);
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
