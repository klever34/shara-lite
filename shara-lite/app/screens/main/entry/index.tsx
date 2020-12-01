import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {View, Text, ToastAndroid, ViewStyle, TextStyle} from 'react-native';
import {applyStyles} from '@/styles';
import {AppInput} from '@/components';
import Icon from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {getAuthService} from '@/services';
import {numberWithCommas} from '@/helpers/utils';

type EntryButtonProps = {
  label?: string;
  children?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const EntryButton = ({
  label = '',
  children = null,
  onPress,
  style,
  textStyle,
}: EntryButtonProps) => {
  return (
    <Touchable onPress={onPress}>
      <View style={applyStyles('flex-1 center bg-white rounded-16 m-4', style)}>
        {children || (
          <Text style={applyStyles('text-sm text-uppercase', textStyle)}>
            {label}
          </Text>
        )}
      </View>
    </Touchable>
  );
};

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

export const EntryScreen = () => {
  const [tokens, setTokens] = useState<string[]>(['0']);
  const [displayedAmount, setDisplayedAmount] = useState('0');
  useEffect(() => {
    setDisplayedAmount(
      tokens.reduce((acc, curr) => {
        return acc + curr;
      }, ''),
    );
  }, [tokens]);

  const enterValue = useCallback((value: string) => {
    return () => {
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
    };
  }, []);

  const handleClear = useCallback(() => {
    setTokens(['0']);
  }, []);

  const handleDelete = useCallback(() => {
    const lastToken = getLastToken(tokens);
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

  const handleCalculate = useCallback(() => {
    try {
      const result = calculate(tokens);
      setDisplayedAmount(numberWithCommas(result));
    } catch (e) {
      ToastAndroid.show('Invalid Amount', ToastAndroid.SHORT);
    }
  }, [tokens]);

  const currency = getAuthService().getUserCurrency();
  return (
    <View style={applyStyles('flex-1')}>
      <View style={applyStyles('pt-40 py-48 px-16 bg-white h-3/10')}>
        <View style={applyStyles('items-center mb-24')}>
          <Text style={applyStyles('text-gray-100 text-xxs text-uppercase')}>
            Last Transaction
          </Text>
          <Text style={applyStyles('text-gray-200 text-xs')}>-₦200,000</Text>
        </View>
        <View>
          <Text
            style={applyStyles(
              'bg-gray-20 text-gray-200 py-4 px-8 rounded-4 text-xxs text-uppercase text-700 font-bold self-center mb-8',
            )}>
            Amount
          </Text>
          <Text
            style={applyStyles(
              'text-gray-300 py-4 px-8 rounded-4 text-3xl text-uppercase text-400 self-center mb-8',
            )}
            numberOfLines={1}>
            {currency + displayedAmount}
          </Text>
        </View>
        <View style={applyStyles('w-full')}>
          <AppInput placeholder="Enter Details (Rent, Bill, Loan...)" />
        </View>
      </View>
      <View style={applyStyles('bg-gray-20 h-7/10 px-8 pt-32 pb-20')}>
        <View style={applyStyles('flex-row flex-1')}>
          <EntryButton label="." onPress={enterValue('.')} />
          <EntryButton
            style={applyStyles('bg-gray-50', {flex: 2})}
            label="clear"
            onPress={handleClear}
          />
          <EntryButton onPress={handleDelete} style={applyStyles('bg-gray-50')}>
            <Icon type="feathericons" name="delete" />
          </EntryButton>
        </View>
        <View style={applyStyles('flex-row flex-1')}>
          <EntryButton label="7" onPress={enterValue('7')} />
          <EntryButton label="8" onPress={enterValue('8')} />
          <EntryButton label="9" onPress={enterValue('9')} />
          <EntryButton
            label="%"
            onPress={enterValue('%')}
            style={applyStyles('bg-gray-50')}
          />
        </View>
        <View style={applyStyles('flex-row flex-1')}>
          <EntryButton label="4" onPress={enterValue('4')} />
          <EntryButton label="5" onPress={enterValue('5')} />
          <EntryButton label="6" onPress={enterValue('6')} />
          <EntryButton
            label="÷"
            onPress={enterValue('÷')}
            style={applyStyles('bg-gray-50')}
          />
        </View>
        <View style={applyStyles('flex-row flex-1')}>
          <EntryButton label="1" onPress={enterValue('1')} />
          <EntryButton label="2" onPress={enterValue('2')} />
          <EntryButton label="3" onPress={enterValue('3')} />
          <EntryButton
            onPress={enterValue('*')}
            style={applyStyles('bg-gray-50')}>
            <Text>x</Text>
          </EntryButton>
        </View>
        <View style={applyStyles('flex-row flex-1')}>
          <EntryButton label="0" onPress={enterValue('0')} />
          <EntryButton label="00" onPress={enterValue('00')} />
          <EntryButton label="000" onPress={enterValue('000')} />
          <EntryButton label="=" onPress={handleCalculate} />
        </View>
        <View style={applyStyles('flex-row flex-1')}>
          <EntryButton
            label="-"
            onPress={enterValue('-')}
            style={applyStyles('bg-gray-50')}
          />
          <EntryButton
            label="+"
            onPress={enterValue('+')}
            style={applyStyles('bg-gray-50')}
          />
        </View>
        <View style={applyStyles('flex-row flex-1')}>
          <EntryButton
            label="You collected"
            style={applyStyles('bg-green-200')}
            textStyle={applyStyles('font-bold text-white')}
          />
          <EntryButton
            label="You gave"
            style={applyStyles('bg-red-200')}
            textStyle={applyStyles('font-bold text-white')}
          />
        </View>
      </View>
    </View>
  );
};

export * from './CreateReceipt';
export * from './ReceiptItemModal';
export * from './ReceiptPreviewModal';
