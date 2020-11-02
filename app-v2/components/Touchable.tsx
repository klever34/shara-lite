import {
  Platform,
  TouchableHighlight,
  TouchableHighlightProps,
  TouchableNativeFeedback,
  TouchableNativeFeedbackProps,
} from 'react-native';
import React, {ReactElement, useMemo} from 'react';
import throttle from 'lodash/throttle';

type TouchableProps = (
  | TouchableNativeFeedbackProps
  | TouchableHighlightProps
) & {
  children: ReactElement;
};

export const Touchable = ({
  onPress,
  children,
  ...restProps
}: TouchableProps) => {
  onPress = useMemo(() => {
    if (onPress) {
      return throttle(onPress, 1000);
    }
    return undefined;
  }, [onPress]);
  if (!onPress) {
    return children;
  }
  return (
    Platform.select({
      android: (
        <TouchableNativeFeedback onPress={onPress} {...restProps}>
          {children}
        </TouchableNativeFeedback>
      ),
      ios: (
        <TouchableHighlight onPress={onPress} {...restProps}>
          {children}
        </TouchableHighlight>
      ),
    }) ?? null
  );
};

export default Touchable;
