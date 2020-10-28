import React from 'react';
import {applyStyles} from 'app-v3/helpers/utils';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import Touchable from './Touchable';

type HeaderTitleProps = {
  title: string;
  description?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export const HeaderTitle = ({
  title,
  description = '',
  onPress,
  style = {},
}: HeaderTitleProps) => {
  return (
    <Touchable onPress={onPress}>
      <View style={applyStyles('flex-1 h-40 justify-center', style)}>
        <Text style={styles.headerTitleText} numberOfLines={1}>
          {title}
        </Text>
        {!!description && (
          <Text style={styles.headerTitleDesc} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  headerTitleText: applyStyles('text-lg text-gray-300 text-uppercase', {
    fontFamily: 'Rubik-Medium',
  }),
  headerTitleDesc: applyStyles('text-sm text-gray-300', {
    fontFamily: 'Rubik-Regular',
  }),
});
