import React, {
  useCallback,
  ReactNode,
  useState,
  createContext,
  useContext,
  useMemo,
  useRef,
  forwardRef,
  createRef,
} from 'react';
import {applyStyles} from '@/styles';
import Big from 'big.js';
import {Keyboard} from 'react-native-ui-lib';
import {Text} from '@/components';
import {View, ScrollView, ViewStyle, TextStyle, TextInput} from 'react-native';
import {CurrencyInput, CurrencyInputProps} from '@/components/CurrencyInput';
import Touchable from '@/components/Touchable';
import Icon from './Icon';
const KeyboardAccessoryView = Keyboard.KeyboardAccessoryView;
const KeyboardRegistry = Keyboard.KeyboardRegistry;

type CalculatorKeyboardItemSelectedEventCallback = (value: Big) => void;

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
  handleEquals?: () => void;
  addEqualsListener?: (callback: (() => void) | undefined) => () => void;
  label?: string;
  result?: Big;
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
  const stack: Big[] = [];
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
    try {
      const secondOperand = stack.pop() as Big;
      const firstOperand = stack.pop() as Big;
      let result;
      switch (operator) {
        case '+':
          result = firstOperand.add(secondOperand);
          break;
        case '-':
          result = firstOperand.sub(secondOperand);
          break;
        case 'x':
          result = firstOperand.mul(secondOperand);
          break;
        case '÷':
          result = firstOperand.div(secondOperand);
          break;
        default:
          throw 'Invalid Operator';
      }
      stack.push(result);
    } catch (e) {
      throw mathError;
    }
  };

  const solveUnary = (operator: string) => {
    try {
      const operand = stack.pop() as Big;
      let result;
      switch (operator) {
        case '%':
          result = operand.div(100);
          break;
        default:
          throw 'Invalid Operator';
      }
      stack.push(result);
    } catch (e) {
      throw mathError;
    }
  };

  const term = () => {
    try {
      stack.push(new Big(lookahead));
      match(lookahead);
    } catch (e) {
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
    if (stack.length === 1) {
      return stack.pop();
    }
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
  const [equalsListener, setEqualsListener] = useState<() => void>();
  const addEventListener = useCallback(
    (callback: CalculatorKeyboardItemSelectedEventCallback) => {
      setValueChangeListener(() => callback);
      return () => {
        setValueChangeListener(undefined);
      };
    },
    [],
  );
  const addEqualsListener = useCallback(
    (callback: (() => void) | undefined) => {
      setEqualsListener(() => callback);
      return () => {
        setEqualsListener(undefined);
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

  const [result, setResult] = useState(new Big(0));

  const handleCalculate = useCallback(() => {
    try {
      let nextResult = calculate(tokens as string[]) as Big;
      nextResult = new Big(nextResult.toFixed(2));
      valueChangeListener?.(nextResult);
      setResult(nextResult);
    } catch (e) {}
  }, [tokens, valueChangeListener]);

  useMemo(() => {
    handleCalculate();
  }, [handleCalculate]);

  const enterValue = useCallback(
    (value: string) => {
      return () => {
        setTokens((prevTokens) => {
          const lastToken = getLastToken(prevTokens);
          if (
            lastToken.includes('.') &&
            (value === '.' ||
              (isValidNumber(value) && lastToken.split('.')[1].length >= 2))
          ) {
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

  const handleEquals = useCallback(() => {
    handleCalculate();
    equalsListener?.();
  }, [equalsListener, handleCalculate]);

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
        handleEquals,
        addEqualsListener,
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
    handleDelete,
    handleEquals,
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
            <CalculatorButton label="C" onPress={handleClear} />
            <CalculatorButton label="7" onPress={enterValue?.('7')} />
            <CalculatorButton label="4" onPress={enterValue?.('4')} />
            <CalculatorButton label="1" onPress={enterValue?.('1')} />
            <CalculatorButton label="00" onPress={enterValue?.('00')} />
          </View>
          <View style={applyStyles('flex-1')}>
            <CalculatorButton onPress={handleDelete}>
              <Icon type="feathericons" name="delete" size={24} />
            </CalculatorButton>
            <CalculatorButton label="8" onPress={enterValue?.('8')} />
            <CalculatorButton label="5" onPress={enterValue?.('5')} />
            <CalculatorButton label="2" onPress={enterValue?.('2')} />
            <CalculatorButton label="0" onPress={enterValue?.('0')} />
          </View>
          <View style={applyStyles('flex-1')}>
            <CalculatorButton
              label="÷"
              onPress={enterValue?.('÷')}
              textStyle={applyStyles('text-2xl')}
            />
            <CalculatorButton label="9" onPress={enterValue?.('9')} />
            <CalculatorButton label="6" onPress={enterValue?.('6')} />
            <CalculatorButton label="3" onPress={enterValue?.('3')} />
            <CalculatorButton label="." onPress={enterValue?.('.')} />
          </View>
          <View style={applyStyles('flex-1')}>
            <CalculatorButton label="x" onPress={enterValue?.('x')} />
            <CalculatorButton
              label="-"
              onPress={enterValue?.('-')}
              textStyle={applyStyles('text-2xl')}
            />
            <CalculatorButton
              label="+"
              onPress={enterValue?.('+')}
              textStyle={applyStyles('text-2xl')}
            />
            <CalculatorButton
              label="="
              onPress={handleEquals}
              style={applyStyles('bg-blue-100', {flex: 2.22})}
              textStyle={applyStyles('text-white text-2xl')}
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

type CalculatorButtonProps = {
  label?: string;
  children?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export const CalculatorButton = ({
  label = '',
  children = null,
  onPress,
  style,
  textStyle,
}: CalculatorButtonProps) => {
  return (
    <Touchable onPress={onPress}>
      <View
        style={applyStyles(
          'flex-1 center bg-white rounded-8 mx-4 my-6',
          style,
        )}>
        {children || (
          <Text
            style={applyStyles('text-xl text-uppercase body-500', textStyle)}>
            {label}
          </Text>
        )}
      </View>
    </Touchable>
  );
};

type CalculatorInputProps = CurrencyInputProps & {
  onEquals?: () => void;
};

export const CalculatorInput = forwardRef<TextInput, CalculatorInputProps>(
  (
    {
      value: initialValue,
      onChangeText: prevOnChangeText,
      onEquals: prevOnEquals,
      ...props
    }: CalculatorInputProps,
    ref,
  ) => {
    const {
      showKbComponent,
      resetKbComponent,
      addEventListener,
      handleReset,
      addEqualsListener,
    } = useContext(CalculatorContext);
    const [value, setValue] = useState<number | undefined>(initialValue);
    const onChangeText = useRef(prevOnChangeText).current;
    const onEquals = useRef(prevOnEquals).current;
    ref = ref ?? createRef();
    const handleFocus = useCallback(() => {
      handleReset?.(String(value ?? '0'));
      showKbComponent?.();
      if (addEventListener) {
        addEventListener((nextValue) => {
          setValue(nextValue.toNumber());
          if (onChangeText) {
            onChangeText(String(nextValue));
          }
        });
      }
      if (addEqualsListener) {
        if (onEquals) {
          addEqualsListener(onEquals);
        } else {
          addEqualsListener(() => {
            resetKbComponent?.();
            if (ref && 'current' in ref) {
              ref.current?.blur();
            }
          });
        }
      }
    }, [
      addEqualsListener,
      addEventListener,
      handleReset,
      onChangeText,
      onEquals,
      ref,
      resetKbComponent,
      showKbComponent,
      value,
    ]);

    return (
      <CurrencyInput
        {...props}
        ref={ref}
        value={value}
        onFocus={handleFocus}
        onTouchStart={handleFocus}
        showSoftInputOnFocus={false}
      />
    );
  },
);
