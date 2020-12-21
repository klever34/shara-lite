import SecureEmblem from '@/assets/images/emblem.svg';
import {AppInput} from '@/components';
import Icon from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency, numberWithCommas} from '@/helpers/utils';
import {getAuthService} from '@/services';
import {applyStyles, navBarHeight} from '@/styles';
import React, {
  ComponentType,
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  PanResponder,
  Keyboard,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {dimensions} from '@/styles';
import {useReceiptList} from '@/screens/main/transactions/hook';

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

type TransactionEntryAmount = {
  label: string;
  value: number;
};

export type TransactionEntryContextProps = {
  amount?: TransactionEntryAmount;
  setAmount?: Dispatch<SetStateAction<TransactionEntryAmount>>;
  tokens?: string[];
  setTokens?: Dispatch<SetStateAction<string[]>>;
  note?: string;
  setNote?: (note: string) => void;
  calculated?: boolean;
  setCalculated?: (calculated: boolean) => void;
  isValidAmount?: boolean;
  showSuccessView?: () => void;
  hideSuccessView?: () => void;
  pan?: Animated.ValueXY;
  reset?: () => void;
};

export const TransactionEntryContext = createContext<
  TransactionEntryContextProps
>({});

export const withTransactionEntry = <ComponentProps extends {}>(
  Component: ComponentType<ComponentProps>,
) => (props: ComponentProps) => {
  const [tokens, setTokens] = useState<string[]>(['0']);
  const [amount, setAmount] = useState({
    label: '0',
    value: 0,
  });

  const [note, setNote] = useState('');

  const pan = useRef(new Animated.ValueXY({x: 0, y: -500})).current;

  const showSuccessView = useCallback(() => {
    Animated.timing(pan, {
      toValue: {x: 0, y: 0},
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [pan]);

  const hideSuccessView = useCallback(() => {
    Animated.spring(pan, {
      toValue: {x: 0, y: -500},
      useNativeDriver: true,
    }).start();
  }, [pan]);

  const reset = useCallback(() => {
    setNote('');
    setAmount({label: '0', value: 0});
    setTokens(['0']);
  }, []);

  return (
    <TransactionEntryContext.Provider
      value={{
        amount,
        setAmount,
        tokens,
        setTokens,
        note,
        setNote,
        showSuccessView,
        hideSuccessView,
        pan,
        reset,
      }}>
      <Component {...props} />
    </TransactionEntryContext.Provider>
  );
};

export type TransactionEntryViewProps = {
  showLastTransactions?: boolean;
  actionButtons: TransactionEntryButtonProps[];
};

export const TransactionEntryView = withTransactionEntry(
  ({showLastTransactions = true, actionButtons}: TransactionEntryViewProps) => {
    const {
      amount,
      setAmount,
      tokens,
      setTokens,
      note,
      setNote,
      pan,
      hideSuccessView,
    } = useContext(TransactionEntryContext);
    const {filteredReceipts} = useReceiptList();
    const lastTransaction = useMemo(() => {
      return filteredReceipts[0];
    }, [filteredReceipts]);
    const [calculated, setCalculated] = useState(false);

    const isValidAmount = useMemo(() => {
      return calculated && amount?.value !== 0;
    }, [amount, calculated]);

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
        setCalculated?.(true);
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
        setCalculated?.(false);
      }
    }, [setAmount, setCalculated, tokens]);

    useEffect(() => {
      handleCalculate();
    }, [handleCalculate]);

    const currency = getAuthService().getUserCurrency();

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event(
          [null, {dy: pan?.y as Animated.Value}],
          {
            useNativeDriver: false,
          },
        ),
        onPanResponderRelease: hideSuccessView,
      }),
    ).current;

    const [showKeypad, setShowKeypad] = useState(true);

    const keyboardDidShow = useCallback(() => {
      setShowKeypad(false);
    }, []);

    const keyboardDidHide = useCallback(() => {
      setShowKeypad(true);
    }, []);

    useEffect(() => {
      Keyboard.addListener('keyboardDidShow', keyboardDidShow);
      Keyboard.addListener('keyboardDidHide', keyboardDidHide);
      return () => {
        Keyboard.removeListener('keyboardDidShow', keyboardDidShow);
        Keyboard.removeListener('keyboardDidHide', keyboardDidHide);
      };
    }, [keyboardDidHide, keyboardDidShow]);

    return (
      <View style={applyStyles({height: dimensions.fullHeight - navBarHeight})}>
        <View style={applyStyles('flex-1')}>
          <View
            style={applyStyles('bg-white justify-center relative', {
              flex: 4,
            })}>
            <Animated.View
              style={applyStyles(
                'absolute bottom-0 right-0 w-full h-full bg-green-200 center',
                {
                  zIndex: 1,
                  transform: [{translateX: pan?.x}, {translateY: pan?.y}],
                },
              )}
              {...panResponder.panHandlers}>
              <SecureEmblem style={applyStyles('w-64 h-64')} />
              <Text
                style={applyStyles('text-lg text-white mt-8 text-uppercase')}>
                <Text>Transaction Added Successfully</Text>
              </Text>
            </Animated.View>
            <View style={applyStyles('pt-24 pb-16 px-16')}>
              {!isValidAmount && showLastTransactions && lastTransaction && (
                <View style={applyStyles('items-center mb-24')}>
                  <Text
                    style={applyStyles(
                      'text-gray-100 text-xxs text-uppercase body-400',
                    )}>
                    Last Transaction
                  </Text>
                  <Text style={applyStyles('text-gray-200 text-xs body-400')}>
                    {`${lastTransaction.isPaid ? '' : '-'}${amountWithCurrency(
                      lastTransaction.isPaid
                        ? lastTransaction.total_amount
                        : lastTransaction.credit_amount,
                    )}`}
                  </Text>
                </View>
              )}
              <View style={applyStyles('mb-6')}>
                <Text
                  style={applyStyles(
                    'bg-gray-20 text-gray-200 py-4 px-8 rounded-4 text-xxs text-uppercase text-700 font-bold self-center mb-4 body-400',
                  )}>
                  Amount
                </Text>
                <Text
                  style={applyStyles(
                    'text-gray-300 py-4 px-8 rounded-4 text-4xl text-uppercase text-400 self-center body-400',
                  )}
                  numberOfLines={1}>
                  {`${currency} ${amount?.label}`}
                </Text>
              </View>
              {isValidAmount && (
                <View style={applyStyles('w-full')}>
                  <AppInput
                    placeholder="Enter Details (Rent, Bill, Loan...)"
                    value={note}
                    onChangeText={setNote}
                    multiline
                  />
                </View>
              )}
            </View>
            {!showKeypad && (
              <View style={applyStyles('flex-row mb-16 px-16')}>
                {isValidAmount && (
                  <TransactionEntryButtons
                    actionButtons={actionButtons}
                    buttonStyle={applyStyles({minHeight: 48})}
                  />
                )}
              </View>
            )}
          </View>
          {showKeypad && (
            <View style={applyStyles('bg-gray-20 px-8 py-16', {flex: 6})}>
              <View style={applyStyles({flex: 6})}>
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
                  <TransactionEntryButton
                    label="00"
                    onPress={enterValue('00')}
                  />
                  <TransactionEntryButton
                    label="000"
                    onPress={enterValue('000')}
                  />
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
              <View style={applyStyles('flex-row flex-1')}>
                {isValidAmount && (
                  <TransactionEntryButtons
                    actionButtons={actionButtons}
                    buttonStyle={applyStyles({minHeight: 48})}
                  />
                )}
              </View>
            </View>
          )}
        </View>
        {!showKeypad && <View style={applyStyles('flex-1')} />}
      </View>
    );
  },
);

type TransactionEntryButtonsProps = {
  actionButtons: TransactionEntryButtonProps[];
  buttonStyle?: ViewStyle;
};

export const TransactionEntryButtons = ({
  actionButtons,
  buttonStyle,
}: TransactionEntryButtonsProps) => {
  return (
    <>
      {actionButtons.map((actionButton) => {
        return (
          <TransactionEntryButton
            key={actionButton.label}
            {...actionButton}
            style={applyStyles(actionButton.style, buttonStyle)}
          />
        );
      })}
    </>
  );
};

type TransactionEntryButtonProps = {
  label?: string;
  children?: ReactNode;
  onPress?: (context: TransactionEntryContextProps) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export const TransactionEntryButton = ({
  label = '',
  children = null,
  onPress,
  style,
  textStyle,
}: TransactionEntryButtonProps) => {
  const context = useContext(TransactionEntryContext);
  return (
    <Touchable
      onPress={() => {
        onPress?.(context);
      }}>
      <View style={applyStyles('flex-1 center bg-white rounded-8 m-4', style)}>
        {children || (
          <Text
            style={applyStyles('text-base text-uppercase body-500', textStyle)}>
            {label}
          </Text>
        )}
      </View>
    </Touchable>
  );
};
