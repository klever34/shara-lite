import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {applyStyles} from '../helpers/utils';
import {colors} from '../styles';
import Icon from './Icon';
import Touchable from './Touchable';

type FAButtonProps = {
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
        style={applyStyles(
          styles.container,
          {backgroundColor: color},
          {...style},
        )}>
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
