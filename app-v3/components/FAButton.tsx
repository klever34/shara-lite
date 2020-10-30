import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {colors} from '../styles';
import Icon from './Icon';
import Touchable from './Touchable';
import {applyStyles} from 'app-v3/styles';

export type FAButtonProps = {
  style?: ViewStyle;
  color?: string;
  iconType?:
    | 'ionicons'
    | 'feathericons'
    | 'octicons'
    | 'material-icons'
    | 'material-community-icons';
  iconName?: string;
  children?: React.ReactNode;
  onPress?: () => void;
};

export const FAButton = ({
  style,
  children,
  iconName,
  iconType = 'ionicons',
  color = colors.primary,
  onPress,
}: FAButtonProps) => {
  return (
    <Touchable onPress={onPress}>
      <View
        style={applyStyles(styles.container, style, {backgroundColor: color})}>
        {children ? (
          children
        ) : (
          <Icon type={iconType} name={iconName} color="white" size={24} />
        )}
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
    position: 'absolute',
    padding: 12,
    bottom: 16,
    right: 16,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
