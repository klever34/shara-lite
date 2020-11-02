import {colors} from '@/styles';
import React from 'react';
import {Text, View, ViewStyle} from 'react-native';
import {applyStyles} from '@/styles';

export const TitleDivider = ({
  title,
  style,
}: {
  title: string;
  style?: ViewStyle;
}) => {
  return (
    <View style={applyStyles('mb-md flex-row justify-space-between', style)}>
      <View
        style={applyStyles({
          flex: 1,
          height: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors['gray-50'],
        })}
      />
      <View
        style={applyStyles('mx-sm', {
          width: 'auto',
        })}>
        <Text
          style={applyStyles('text-400 text-center text-uppercase', {
            color: colors['gray-300'],
          })}>
          {title}
        </Text>
      </View>
      <View
        style={applyStyles({
          flex: 1,
          height: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors['gray-50'],
        })}
      />
    </View>
  );
};
