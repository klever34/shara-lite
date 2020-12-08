/**
 * https://goshakkk.name/react-native-animated-appearance-disappearance/
 */

import React, {Component, ReactNode} from 'react';
import {Animated, ViewStyle} from 'react-native';

type Props = {
  visible: boolean;
  style?: ViewStyle;
  duration?: number;
  children: ReactNode;
};

type State = {
  visible: boolean;
};

export class Fade extends Component<Props, State> {
  private _visibility: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      visible: props.visible,
    };
  }

  UNSAFE_componentWillMount() {
    this._visibility = new Animated.Value(this.props.visible ? 1 : 0);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.visible) {
      this.setState({visible: true});
    }
    Animated.timing(this._visibility, {
      useNativeDriver: false,
      toValue: nextProps.visible ? 1 : 0,
      duration: this.props.duration || 180,
    }).start(() => {
      this.setState({visible: nextProps.visible});
    });
  }

  render() {
    const {style, children} = this.props;

    const containerStyle = {
      opacity: this._visibility.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    };

    const combinedStyle = [containerStyle, style];
    return (
      <Animated.View
        style={this.state.visible ? combinedStyle : containerStyle}>
        {this.state.visible ? children : null}
      </Animated.View>
    );
  }
}
