import Touchable from './Touchable';
import {Platform, StyleSheet, View, ViewStyle} from 'react-native';
import React from 'react';
import {colors} from '../styles';
import {applyStyles} from '../helpers/utils';
import Icon from './Icon';

type FAButtonProps = {
  style?: ViewStyle;
  color?: string;
  iconName?: string;
  children?: React.ReactNode;
  onPress?: () => void;
};

export const FAButton = ({
  style,
  children,
  iconName,
  color = colors.primary,
  onPress,
}: FAButtonProps) => {
  return (
    <Touchable onPress={onPress}>
      <View
        style={applyStyles(
          styles.container,
          {backgroundColor: color},
          {...style},
        )}>
        {children ? (
          children
        ) : (
          <Icon
            type="ionicons"
            name={
              Platform.select({
                android: 'md-' + iconName,
                ios: 'ios-' + iconName,
              }) as string
            }
            color="white"
            size={24}
          />
        )}
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
    width: 64,
    height: 64,
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
