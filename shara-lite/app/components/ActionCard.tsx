import React from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors} from '../styles';
import Touchable from './Touchable';
import {applyStyles} from '@/styles';

type Props = {
  onClick?(): void;
  style?: ViewStyle;
  buttonText?: string;
  children: React.ReactNode;
};

export const ActionCard = (props: Props) => {
  const {children, onClick, style, buttonText} = props;
  return (
    <Touchable onPress={onClick}>
      <View style={applyStyles(styles.container, {...style})}>
        {children}
        {onClick && (
          <Touchable onPress={onClick}>
            <View
              style={applyStyles(
                'flex-row',
                'items-center',
                'justify-center',
                styles.button,
              )}>
              <Text style={applyStyles('text-400', styles.buttonText)}>
                {buttonText}
              </Text>
            </View>
          </Touchable>
        )}
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 2,
    borderRadius: 8,
    paddingTop: 24,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  button: {
    marginTop: 12,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors['gray-20'],
  },
  buttonText: {
    fontSize: 16,
    paddingLeft: 4,
    color: colors.primary,
    textTransform: 'uppercase',
  },
});
