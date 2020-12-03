import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import {
  View,
  Text,
  ToastAndroid,
  ViewStyle,
  TextStyle,
  Animated,
  PanResponder,
} from 'react-native';
import {applyStyles} from '@/styles';
import {AppInput} from '@/components';
import Icon from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {getAnalyticsService, getAuthService} from '@/services';
import {numberWithCommas} from '@/helpers/utils';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {CustomerListScreen} from './CustomerListScreen';
import {handleError} from '@/services/error-boundary';
import {useTransaction} from '@/services/transaction';
import {useAppNavigation} from '@/services/navigation';
import SecureEmblem from '@/assets/images/emblem.svg';

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
          <Text style={applyStyles('text-base text-uppercase', textStyle)}>
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

export const EntryScreen = withModal(({openModal}: ModalWrapperFields) => {
  const [tokens, setTokens] = useState<string[]>(['0']);
  const [amount, setAmount] = useState({
    label: '0',
    value: 0,
  });
  const [calculated, setCalculated] = useState(false);

  const isValidAmount = useMemo(() => {
    return calculated && amount.value !== 0;
  }, [amount.value, calculated]);

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
      const result = calculate(tokens) as number;
      setAmount({
        label: numberWithCommas(result),
        value: result,
      });
      setCalculated(true);
    } catch (e) {
      setAmount(() => {
        return {
          label: tokens.reduce((acc, curr) => {
            return acc + curr;
          }, ''),
          value: 0,
        };
      });
      setCalculated(false);
    }
  }, [tokens]);

  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  useEffect(() => {
    if (!isValidAmount) {
      ToastAndroid.show('Invalid Amount', ToastAndroid.SHORT);
    }
  }, [isValidAmount]);
  const {youGave, youGot} = useTransaction();
  const [note, setNote] = useState('');

  const navigation = useAppNavigation();

  const handleYouGave = useCallback(() => {
    const closeFullModal = openModal('full', {
      renderContent: () => {
        return (
          <CustomerListScreen
            onClose={closeFullModal}
            onSelectCustomer={(customer) => {
              closeFullModal();
              const closeLoadingModal = openModal('loading', {
                text: 'Creating Transaction',
              });
              getAnalyticsService()
                .logEvent('selectContent', {
                  item_id:
                    '_id' in customer ? customer?._id?.toString() ?? '' : '',
                  content_type: 'customer',
                })
                .then(() => {});
              youGave({customer, amount: amount.value, note})
                .then((receipt) => {
                  const {customer: nextCustomer} = receipt;
                  navigation.navigate('CustomerDetails', {
                    customer: nextCustomer,
                    header: {
                      backButton: false,
                      style: applyStyles({left: 0}),
                    },
                    sendReminder: false,
                    actionButtons: [
                      {
                        onPress: () => {
                          navigation.goBack();
                        },
                        variantColor: 'red',
                        style: applyStyles({width: '50%'}),
                        children: (
                          <Text
                            style={applyStyles(
                              'text-uppercase text-white text-700',
                            )}>
                            Finish
                          </Text>
                        ),
                      },
                    ],
                  });
                  setNote('');
                  setAmount({label: '0', value: 0});
                })
                .catch(handleError)
                .finally(() => {
                  closeLoadingModal();
                });
            }}
          />
        );
      },
    });
  }, [amount.value, navigation, note, openModal, youGave]);

  const currency = getAuthService().getUserCurrency();

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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, {dy: pan.y}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: hideSuccessView,
    }),
  ).current;

  const handleYouCollected = useCallback(() => {
    youGot({amount: amount.value, note}).then(() => {
      showSuccessView();
      setTimeout(() => {
        hideSuccessView();
      }, 2000);
      setNote('');
      setAmount({label: '0', value: 0});
    });
  }, [amount.value, hideSuccessView, note, showSuccessView, youGot]);
  return (
    <View style={applyStyles('h-full')}>
      <View
        style={applyStyles('bg-white justify-center relative', {
          flex: 3,
        })}>
        <Animated.View
          style={applyStyles(
            'absolute bottom-0 right-0 w-full h-full bg-green-200 center',
            {zIndex: 1, transform: [{translateX: pan.x}, {translateY: pan.y}]},
          )}
          {...panResponder.panHandlers}>
          <SecureEmblem style={applyStyles('w-64 h-64')} />
          <Text style={applyStyles('text-lg text-white mt-8 text-uppercase')}>
            <Text>Transaction Added Successful</Text>
          </Text>
        </Animated.View>
        <View style={applyStyles('pt-24 pb-16 px-16')}>
          {!isValidAmount && (
            <View style={applyStyles('items-center mb-24')}>
              <Text
                style={applyStyles('text-gray-100 text-xxs text-uppercase')}>
                Last Transaction
              </Text>
              <Text style={applyStyles('text-gray-200 text-xs')}>
                -₦200,000
              </Text>
            </View>
          )}
          <View style={applyStyles('mb-6')}>
            <Text
              style={applyStyles(
                'bg-gray-20 text-gray-200 py-4 px-8 rounded-4 text-xxs text-uppercase text-700 font-bold self-center mb-4',
              )}>
              Amount
            </Text>
            <Text
              style={applyStyles(
                'text-gray-300 py-4 px-8 rounded-4 text-4xl text-uppercase text-400 self-center',
              )}
              numberOfLines={1}>
              {`${currency} ${amount.label}`}
            </Text>
          </View>
          {isValidAmount && (
            <View style={applyStyles('w-full')}>
              <AppInput
                placeholder="Enter Details (Rent, Bill, Loan...)"
                value={note}
                onChangeText={setNote}
              />
            </View>
          )}
        </View>
      </View>
      <View style={applyStyles('bg-gray-20 px-8 py-16', {flex: 7})}>
        <View style={applyStyles('flex-row flex-1')}>
          <EntryButton label="." onPress={enterValue('.')} />
          <EntryButton
            style={applyStyles('bg-gray-50', {flex: 2})}
            label="clear"
            onPress={handleClear}
          />
          <EntryButton onPress={handleDelete} style={applyStyles('bg-gray-50')}>
            <Icon type="feathericons" name="delete" size={24} />
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
          {isValidAmount && (
            <>
              <EntryButton
                label="You collected"
                style={applyStyles('bg-green-200')}
                textStyle={applyStyles('font-bold text-white')}
                onPress={handleYouCollected}
              />
              <EntryButton
                label="You gave"
                style={applyStyles('bg-red-200')}
                textStyle={applyStyles('font-bold text-white')}
                onPress={handleYouGave}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
});
