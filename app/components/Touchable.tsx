import {
  Platform,
  TouchableHighlight,
  TouchableHighlightProps,
  TouchableNativeFeedback,
  TouchableNativeFeedbackProps,
} from 'react-native';
import React, {ReactElement} from 'react';

type TouchableProps = (
  | TouchableNativeFeedbackProps
  | TouchableHighlightProps
) & {
  children: ReactElement;
};

const Touchable = ({onPress, children, ...restProps}: TouchableProps) => {
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
