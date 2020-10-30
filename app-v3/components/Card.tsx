import React, {ReactNode} from 'react';
import {View, ViewStyle, Text} from 'react-native';
import Touchable from 'app-v3/components/Touchable';
import {Icon} from 'app-v3/components/Icon';
import {applyStyles} from 'app-v3/styles';

type CardProps = {
  style?: ViewStyle;
  children: ReactNode;
};

export const Card = ({style, children}: CardProps) => {
  return (
    <View
      style={applyStyles('w-full p-lg elevation-3 bg-white rounded-16', style)}>
      {children}
    </View>
  );
};

type CardHeaderProps = {
  style?: ViewStyle;
  children: ReactNode;
};

export const CardHeader = ({style, children}: CardHeaderProps) => {
  return (
    <Text style={applyStyles('font-bold text-base text-700', style)}>
      {children}
    </Text>
  );
};

type CardDetailProps = {
  style?: ViewStyle;
  name: string;
  value: string;
  onPress?: () => void;
  onMorePress?: () => void;
};

export const CardDetail = ({
  style,
  name,
  value,
  onPress,
  onMorePress,
}: CardDetailProps) => {
  return (
    <Touchable onPress={onPress}>
      <View style={applyStyles('flex-row items-center')}>
        <View style={applyStyles('flex-1', style)}>
          <Text
            style={applyStyles('text-base text-xs text-400 text-primary mb-2')}>
            {name}
          </Text>
          <Text style={applyStyles('text-base text-400')}>{value}</Text>
        </View>
        {onMorePress && (
          <Touchable onPress={onMorePress}>
            <View style={applyStyles('w-32 h-32 center ml-4')}>
              <Icon
                size={16}
                type="feathericons"
                name="more-vertical"
                style={applyStyles('')}
                onPress={onMorePress}
              />
            </View>
          </Touchable>
        )}
      </View>
    </Touchable>
  );
};

type CardButtonProps = {
  onPress?: () => void;
  children: ReactNode;
};

export const CardButton = ({onPress, children}: CardButtonProps) => {
  return (
    <Touchable onPress={onPress}>
      <View
        style={applyStyles(
          'border-t-1 border-t-gray-20 flex-row items-center justify-center p-16 mt-16',
        )}>
        <Icon
          type="feathericons"
          name="edit"
          style={applyStyles('mr-4 text-primary')}
          size={20}
        />
        <Text style={applyStyles('text-base text-primary uppercase text-400')}>
          {children}
        </Text>
      </View>
    </Touchable>
  );
};
