import React, {useCallback} from 'react';
import {ActivityIndicator, StyleSheet, View, ViewStyle} from 'react-native';
import {applyStyles, colors} from '../styles';
import Icon from './Icon';
import Touchable from './Touchable';

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
  isLoading?: boolean;
};

export const FAButton = ({
  style,
  children,
  iconName,
  iconType = 'ionicons',
  color = colors.primary,
  onPress,
  isLoading,
}: FAButtonProps) => {
  const renderContent = useCallback(() => {
    if (children) {
      return children;
    }
    return <Icon type={iconType} name={iconName} color="white" size={24} />;
  }, [children, iconType, iconName]);

  return (
    <Touchable onPress={onPress}>
      <View
        style={applyStyles(styles.container, style, {backgroundColor: color})}>
        {isLoading ? (
          <ActivityIndicator animating={isLoading} color={colors.white} />
        ) : (
          renderContent()
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
