import React, {
  Component,
  createContext,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import {View, Text, Animated, StyleSheet} from 'react-native';
import {applyStyles, colors} from '@/styles';

export type ToastProps = {
  backgroundColor?: string;
  position?: 'top' | 'bottom';
  textColor?: string;
  orientation?: 'xAxis' | 'yAxis';
};

export type ToastState = {
  renderToast: boolean;
};

export class Toast extends Component<ToastProps, ToastState> {
  static defaultProps: ToastProps = {
    backgroundColor: '#666666',
    textColor: 'white',
    orientation: 'yAxis',
    position: 'top',
  };

  state = {renderToast: false};

  private readonly animateTranslate: Animated.Value;
  private readonly animateOpacity: Animated.Value;
  private isShownToast: boolean;
  private message: string;
  private timerID: number = -1;

  constructor(props: ToastProps) {
    super(props);
    this.animateTranslate = new Animated.Value(-10);

    this.animateOpacity = new Animated.Value(0);

    this.isShownToast = false;

    this.message = '';
  }

  componentWillUnmount() {
    this.timerID && clearTimeout(this.timerID);
  }

  showToast = (message = '', duration = 3000) => {
    if (!this.isShownToast && message) {
      this.message = message;

      this.isShownToast = true;

      this.setState({renderToast: true}, () => {
        Animated.parallel([
          Animated.timing(this.animateTranslate, {
            useNativeDriver: true,
            toValue: 0,
            duration: 350,
          }),

          Animated.timing(this.animateOpacity, {
            useNativeDriver: true,
            toValue: 1,
            duration: 350,
          }),
        ]).start(() => this.hideToast(duration));
      });
    }
  };

  hideToast = (duration: number) => {
    this.timerID = setTimeout(() => {
      Animated.parallel([
        Animated.timing(this.animateTranslate, {
          useNativeDriver: true,
          toValue: 10,
          duration: 350,
        }),

        Animated.timing(this.animateOpacity, {
          useNativeDriver: true,
          toValue: 0,
          duration: 350,
        }),
      ]).start(() => {
        this.setState({renderToast: false});
        this.animateTranslate.setValue(-10);
        this.isShownToast = false;
        clearTimeout(this.timerID);
      });
    }, duration);
  };

  render() {
    const {position, backgroundColor, textColor, orientation} = this.props;

    if (this.state.renderToast) {
      return (
        <Animated.View
          style={applyStyles(styles.animatedToastViewContainer, {
            top: position === 'top' ? '5%' : '80%',
            transform: [
              orientation === 'yAxis'
                ? {
                    translateY: this.animateTranslate,
                  }
                : {
                    translateX: this.animateTranslate,
                  },
            ],
            opacity: this.animateOpacity,
          })}
          pointerEvents="none">
          <View
            style={applyStyles(
              styles.animatedToastView,
              {backgroundColor},
              'rounded',
            )}>
            <Text
              numberOfLines={1}
              style={applyStyles(
                styles.toastText,
                'text-uppercase text-700 font-bold',
                {color: textColor},
              )}>
              {this.message}
            </Text>
          </View>
        </Animated.View>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  animatedToastViewContainer: {
    width: '100%',
    zIndex: 9999,
    position: 'absolute',
  },

  animatedToastView: {
    marginHorizontal: 32,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: 'center',
    alignSelf: 'center',
  },

  toastText: {
    fontSize: 10,
    lineHeight: 16,
    alignSelf: 'stretch',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});

type ShowToast = (message?: string, duration?: number) => void;
type HideToast = (duration: number) => void;

export type ToastContextProps = {
  showToast: ShowToast;
  hideToast: HideToast;
};

export const ToastContext = createContext<ToastContextProps>({
  showToast: () => {},
  hideToast: () => {},
});

export type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({children}: ToastProviderProps) => {
  const toastRef = useRef<Toast | null>(null);

  const showToast: ShowToast = useCallback((...args) => {
    toastRef.current?.showToast(...args);
  }, []);

  const hideToast: HideToast = useCallback((...args) => {
    toastRef.current?.hideToast(...args);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
      }}>
      {children}
      <Toast ref={toastRef} backgroundColor={colors['green-100']} />
    </ToastContext.Provider>
  );
};
