import React, {ReactNode, useCallback} from 'react';
import {Text, View, ViewStyle, TextStyle} from 'react-native';
import {applyStyles, colors} from '@/styles';
import {HeaderBackButton, HeaderBackButtonProps} from './HeaderBackButton';
import {HeaderRight, HeaderRightProps} from '@/components/HeaderRight';

export type HeaderTitleProps = {
  title?: string;
  style?: ViewStyle;
  children?: ReactNode;
  iconLeft?: HeaderBackButtonProps;
  headerRight?: HeaderRightProps;
  titleStyle?: TextStyle | string;
};

export const Header = ({
  title,
  style,
  iconLeft,
  headerRight,
  children,
  titleStyle,
}: HeaderTitleProps) => {
  const renderContent = useCallback(() => {
    if (title) {
      return (
        <View style={applyStyles('flex-1 center flex-row h-36 mx-48')}>
          <Text
            style={applyStyles(
              'text-500 text-uppercase text-gray-200',
              titleStyle,
            )}
            numberOfLines={1}>
            {title}
          </Text>
        </View>
      );
    }
    if (children) {
      return children;
    }
  }, [title, children, titleStyle]);

  return (
    <View
      style={applyStyles(
        'flex-row py-8 bg-white relative',
        {
          borderBottomWidth: 1,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.34,
          shadowRadius: 6.27,
          elevation: 10,
          borderBottomColor: colors['gray-10'],
        },
        style,
      )}>
      {iconLeft && (
        <View style={applyStyles('absolute h-full top-8 left-8')}>
          <HeaderBackButton {...iconLeft} />
        </View>
      )}
      {renderContent()}
      {headerRight && (
        <View style={applyStyles('absolute h-full top-12 right-0')}>
          <HeaderRight {...headerRight} />
        </View>
      )}
    </View>
  );
};
