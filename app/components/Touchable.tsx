import {
  Platform,
  TouchableHighlight,
  TouchableHighlightProps,
  TouchableNativeFeedback,
  TouchableNativeFeedbackProps,
} from 'react-native';
import {ElementType} from 'react';

const Touchable: ElementType<
  TouchableNativeFeedbackProps | TouchableHighlightProps
> = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableHighlight;

export default Touchable;
