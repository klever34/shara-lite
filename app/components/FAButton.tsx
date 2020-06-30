import Touchable from './Touchable';
import {Platform, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../styles/base';
import {mergeStyles} from '../helpers/utils';

type FAButtonProps = {
  iconName: string;
  color?: string;
  onPress?: () => void;
};

export const FAButton = ({
  iconName,
  color = colors.primary,
  onPress,
}: FAButtonProps) => {
  return (
    <Touchable onPress={onPress}>
      <View style={mergeStyles(styles.container, {backgroundColor: color})}>
        <Ionicons
          name={
            Platform.select({
              android: 'md-' + iconName,
              ios: 'ios-' + iconName,
            }) as string
          }
          color="white"
          size={24}
        />
      </View>
    </Touchable>
  );
};

const styles = {
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
};
