import React from 'react';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import {SecurityOptionsScreen} from './SecurityOptionsScreen';
import {RouteProp} from '@react-navigation/native';
import {MainStackParamList} from '@/screens/main';
import {CreateTransactionPin} from './CreateTransactionPin';
import {TransactionPinSuccessScreen} from './TransactionPinSuccessScreen';
import {ChangeSecurityQuestions} from './ChangeSecurityQuestions';
import {ChangeTransactionPin} from './ChangeTransactionPin';
import {EnterTransaction} from './EnterTransaction';
import {NotSetTransactionPinPage} from './NotSetTransactionPinModal';
import {RecoverTransactionPin} from './RecoverTransactionPin';
import {SecurityQuestions} from './SecurityQuestions';
import {SecurityQuestionsSuccessScreen} from './SecurityQuestionsSuccess';
import {SecurityProvider} from './context';

export type SecurityStackParamList = {
  SecurityOptions: undefined;
  SetTransactionPin: undefined;
  TransactionPinSuccessScreen: undefined;
  SecurityQuestionsSuccessScreen: undefined;
  SecurityQuestions: undefined;
  ChangeSecurityQuestions: undefined;
  VerifyTransactionPin: undefined;
  RecoverTransactionPin: undefined;
  ChangeTransactionPin: undefined;
  NotSetTransactionPin: undefined;
};

const SecurityStack = createNativeStackNavigator<SecurityStackParamList>();

type SecurityScreenProps = {
  route: RouteProp<MainStackParamList, 'SecuritySettings'>;
};

export const SecurityScreen = ({route}: SecurityScreenProps) => {
  const {pinSet: initialPinSet} = route.params;

  return (
    <SecurityProvider initialPinSet={initialPinSet}>
      <SecurityStack.Navigator
        initialRouteName="SecurityOptions"
        screenOptions={{
          headerShown: false,
        }}>
        <SecurityStack.Screen
          name="SecurityOptions"
          component={SecurityOptionsScreen}
        />
        <SecurityStack.Screen
          name="SetTransactionPin"
          component={CreateTransactionPin}
          options={{
            headerShown: false,
          }}
        />

        <SecurityStack.Screen
          name="TransactionPinSuccessScreen"
          component={TransactionPinSuccessScreen}
          options={{
            headerShown: false,
          }}
        />

        <SecurityStack.Screen
          name="SecurityQuestionsSuccessScreen"
          component={SecurityQuestionsSuccessScreen}
          options={{
            headerShown: false,
          }}
        />

        <SecurityStack.Screen
          name="SecurityQuestions"
          component={SecurityQuestions}
          options={{
            headerShown: false,
          }}
        />

        <SecurityStack.Screen
          name="ChangeSecurityQuestions"
          component={ChangeSecurityQuestions}
          options={{
            headerShown: false,
          }}
        />

        <SecurityStack.Screen
          name="VerifyTransactionPin"
          component={EnterTransaction}
          options={{
            headerShown: false,
          }}
        />

        <SecurityStack.Screen
          name="RecoverTransactionPin"
          component={RecoverTransactionPin}
          options={{
            headerShown: false,
          }}
        />

        <SecurityStack.Screen
          name="ChangeTransactionPin"
          component={ChangeTransactionPin}
          options={{
            headerShown: false,
          }}
        />

        <SecurityStack.Screen
          name="NotSetTransactionPin"
          component={NotSetTransactionPinPage}
          options={{
            headerShown: false,
          }}
        />
      </SecurityStack.Navigator>
    </SecurityProvider>
  );
};
