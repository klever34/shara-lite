import {colors} from '@/styles';
import React from 'react';
import {Text, View, ViewStyle} from 'react-native';
import {applyStyles} from '@/styles';

export const TitleDivider = ({
  title,
  style,
  showLine = true,
}: {
  title: string;
  style?: ViewStyle;
  showLine?: boolean;
}) => {
  return (
    <View
      style={applyStyles(
        'mb-lg flex-row justify-space-between center w-full',
        style,
      )}>
      {showLine && (
        <View
          style={applyStyles({
            flex: 1,
            height: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-50'],
          })}
        />
      )}
      <View
        style={applyStyles('mx-sm', {
          width: 'auto',
        })}>
        <Text
          style={applyStyles(
            'text-700 text-sm text-gray-200 text-center text-uppercase',
            {
              color: colors['gray-200'],
              letterSpacing: 1.2,
            },
          )}>
          {title}
        </Text>
      </View>
      {showLine && (
        <View
          style={applyStyles({
            flex: 1,
            height: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-50'],
          })}
        />
      )}
    </View>
  );
};
