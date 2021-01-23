import {applyStyles, colors} from '@/styles';
import React, {ReactNode, useRef, useState} from 'react';
import {Text} from '@/components';
import {
  Animated,
  Easing,
  StyleSheet,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {Icon} from './Icon';

type AccordiontemProps = {
  title?: string;
  children?: ReactNode;
  contentStyle?: ViewStyle;
  titleTextStyle?: TextStyle;
  titleContainerStyle?: ViewStyle;
};

export const Accordiontem = ({
  title,
  children,
  contentStyle,
  titleTextStyle,
  titleContainerStyle,
}: AccordiontemProps) => {
  const [open, setOpen] = useState(false);
  const animatedController = useRef(new Animated.Value(0)).current;
  const [bodySectionHeight, setBodySectionHeight] = useState(1);

  const bodyHeight = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, bodySectionHeight],
  });

  const arrowAngle = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: ['0rad', `${Math.PI}rad`],
  });

  const toggleListItem = () => {
    if (open) {
      Animated.timing(animatedController, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      }).start();
    } else {
      Animated.timing(animatedController, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      }).start();
    }
    setOpen(!open);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={() => toggleListItem()}>
        <View
          style={applyStyles(
            'flex-row justify-between items-center py-8 px-16',
            {
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: colors['gray-10'],
            },
            titleContainerStyle,
          )}>
          <Text style={applyStyles('text-gray-300', titleTextStyle)}>
            {title}
          </Text>
          <Animated.View style={{transform: [{rotateZ: arrowAngle}]}}>
            <Icon
              size={20}
              type="feathericons"
              name="chevron-down"
              color={colors['gray-300']}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.bodyBackground, {height: bodyHeight}]}>
        <View
          style={applyStyles('absolute bottom-0', contentStyle)}
          onLayout={(event) =>
            setBodySectionHeight(event.nativeEvent.layout.height)
          }>
          {children}
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  bodyBackground: {
    overflow: 'hidden',
  },
});
