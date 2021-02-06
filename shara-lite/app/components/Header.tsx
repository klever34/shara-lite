import React, {ReactNode, useCallback} from 'react';
import {Text} from '@/components';
import {View, ViewStyle, TextStyle} from 'react-native';
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
        'flex-row py-16 bg-white relative items-center',
        {
          borderBottomWidth: 1.5,
          borderBottomColor: colors['gray-20'],
        },
        style,
      )}>
      {iconLeft && (
        <View style={applyStyles('absolute center h-full')}>
          <HeaderBackButton {...iconLeft} />
        </View>
      )}
      {renderContent()}
      {headerRight && (
        <View style={applyStyles('absolute h-full top-16 right-0')}>
          <HeaderRight {...headerRight} />
        </View>
      )}
    </View>
  );
};
