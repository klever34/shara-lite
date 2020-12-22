import React, {
  useCallback,
  ReactNode,
  useState,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {applyStyles} from '@/styles';
import {TransactionEntryButton} from '@/components/TransactionEntryView';
import {Keyboard} from 'react-native-ui-lib';
import {View, ScrollView, Text} from 'react-native';
import {CurrencyInput, CurrencyInputProps} from '@/components/CurrencyInput';
const KeyboardAccessoryView = Keyboard.KeyboardAccessoryView;
const KeyboardRegistry = Keyboard.KeyboardRegistry;

type CalculatorKeyboardItemSelectedEventCallback = (value: number) => void;

type CalculatorContextProps = {
  showKbComponent?: () => void;
  resetKbComponent?: () => void;
  addEventListener?: (
    callback: CalculatorKeyboardItemSelectedEventCallback,
  ) => () => void;
  enterValue?: (value: string) => () => void;
  handleClear?: () => void;
  handleReset?: (value?: string) => void;
  handleDelete?: () => void;
  handleCalculate?: () => void;
  label?: string;
  result?: number;
  tokens?: string[];
};

const CalculatorContext = createContext<CalculatorContextProps>({});

const getLastToken = (tokens: string[]) => {
  return tokens[tokens.length - 1];
};

const trimZeros = (nextToken: string) => {
  return nextToken.replace(/^0+/, '') || '0';
};

const isValidNumber = (number: string) => !isNaN(parseInt(number, 10));
const isBinaryOperator = (operator: string) =>
  ['+', '-', 'x', '÷'].includes(operator);

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
  const tokensEnumerator = createEnumerator(tokens);
  const stack: number[] = [];
  let lookahead = tokensEnumerator.moveNext()
    ? tokensEnumerator.getCurrent()
    : '</>';
  const syntaxError = new Error('Syntax Error');
  const mathError = new Error('Math Error');

  const match = (token: string) => {
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
      case 'x':
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
      } else if (lookahead === 'x') {
        match('x');
        term();
        solveBinary('x');
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
  const [valueChangeListener, setValueChangeListener] = useState<
    CalculatorKeyboardItemSelectedEventCallback
  >();
  const addEventListener = useCallback(
    (callback: CalculatorKeyboardItemSelectedEventCallback) => {
      setValueChangeListener(() => callback);
      return () => {
        setValueChangeListener(undefined);
      };
    },
    [],
  );

  const [tokens, setTokens] = useState<string[]>(['0']);

  const label = useMemo(() => {
    return tokens.reduce((acc, token) => {
      return acc + ' ' + token;
    }, '');
  }, [tokens]);

  const [result, setResult] = useState(0);

  const handleCalculate = useCallback(() => {
    try {
      const nextResult = calculate(tokens as string[]) as number;
      valueChangeListener?.(result);
      setResult(nextResult);
    } catch (e) {}
  }, [result, tokens, valueChangeListener]);

  useMemo(() => {
    handleCalculate();
  }, [handleCalculate]);

  const enterValue = useCallback(
    (value: string) => {
      return () => {
        setTokens((prevTokens) => {
          const lastToken = getLastToken(prevTokens);
          if (lastToken.includes('.') && value === '.') {
            return prevTokens;
          } else if (
            (isValidNumber(value) || value === '.') &&
            isValidNumber(lastToken)
          ) {
            let nextToken;
            nextToken = lastToken + value;
            return [
              ...prevTokens.slice(0, prevTokens.length - 1),
              trimZeros(nextToken),
            ];
          } else if (isBinaryOperator(lastToken) && isBinaryOperator(value)) {
            return [
              ...prevTokens.slice(0, prevTokens.length - 1),
              trimZeros(value),
            ];
          } else {
            return [...prevTokens, trimZeros(value)];
          }
        });
      };
    },
    [setTokens],
  );

  const handleReset = useCallback((initialValue = '0') => {
    setTokens([initialValue]);
  }, []);

  const handleClear = useCallback(() => {
    handleReset();
  }, [handleReset]);

  const handleDelete = useCallback(() => {
    const lastToken = getLastToken(tokens as string[]);
    if (lastToken.length === 1) {
      if (tokens.length === 1) {
        setTokens(['0']);
      } else {
        setTokens((prevTokens) => {
          return [...prevTokens.slice(0, prevTokens.length - 1)];
        });
      }
    } else {
      setTokens((prevTokens) => {
        return [
          ...prevTokens.slice(0, prevTokens.length - 1),
          lastToken.slice(0, lastToken.length - 1),
        ];
      });
    }
  }, [tokens]);

  return (
    <CalculatorContext.Provider
      value={{
        showKbComponent,
        resetKbComponent,
        addEventListener,
        enterValue,
        handleClear,
        handleReset,
        handleDelete,
        handleCalculate,
        label,
        result,
        tokens,
      }}>
      {children}
      <KeyboardAccessoryView
        kbComponent={kbComponent}
        onRequestShowKeyboard={showKbComponent}
        onKeyboardResigned={resetKbComponent}
      />
    </CalculatorContext.Provider>
  );
}

export const CalculatorKeyboardName = 'CalculatorKeyboard';

const CalculatorKeyboard = () => {
  const {
    enterValue,
    handleClear,
    handleCalculate,
    tokens,
    label,
    result,
  } = useContext(CalculatorContext);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={applyStyles('w-screen')}
      keyboardShouldPersistTaps="always">
      <View style={applyStyles('w-full')}>
        <View style={applyStyles('p-8 center w-full')}>
          {tokens && tokens.length > 1 && (
            <Text style={applyStyles('text-base text-700')}>
              {`${label} = ${result}`}
            </Text>
          )}
        </View>
        <View style={applyStyles('flex-1 flex-row px-16 w-full')}>
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
              onPress={enterValue?.('x')}
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
              style={applyStyles('bg-red-200', {flex: 2.22})}
              textStyle={applyStyles('text-white')}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

KeyboardRegistry.registerKeyboard(
  CalculatorKeyboardName,
  () => CalculatorKeyboard,
);

type CalculatorInputProps = CurrencyInputProps & {};

export const CalculatorInput = ({
  value: initialValue,
  onChangeText: prevOnChangeText,
  ...props
}: CalculatorInputProps) => {
  const {
    showKbComponent,
    resetKbComponent,
    addEventListener,
    handleReset,
  } = useContext(CalculatorContext);
  const [value, setValue] = useState<number | undefined>(initialValue);
  const onChangeText = useRef(prevOnChangeText).current;

  useEffect(() => {
    if (addEventListener) {
      return addEventListener((nextValue) => {
        setValue(nextValue);
        if (onChangeText) {
          onChangeText(String(value));
        }
      });
    }
  }, [addEventListener, onChangeText, value]);

  const handleFocus = useCallback(() => {
    handleReset?.(String(value ?? '0'));
    showKbComponent?.();
    if (addEventListener) {
      addEventListener((nextValue) => {
        setValue(nextValue);
        if (onChangeText) {
          onChangeText(String(nextValue));
        }
      });
    }
  }, [addEventListener, handleReset, onChangeText, showKbComponent, value]);
  const handleBlur = useCallback(() => {
    resetKbComponent?.();
  }, [resetKbComponent]);

  return (
    <CurrencyInput
      {...props}
      value={value}
      onFocus={handleFocus}
      onTouchStart={handleFocus}
      onBlur={handleBlur}
      showSoftInputOnFocus={false}
    />
  );
};
