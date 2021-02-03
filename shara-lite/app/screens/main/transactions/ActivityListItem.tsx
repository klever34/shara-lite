import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {IActivity} from '@/models/Activity';
import {applyStyles, colors} from '@/styles';
import {formatDistanceToNowStrict} from 'date-fns';
import React from 'react';
import {Text, View, ViewStyle} from 'react-native';

export type ActivityListItemProps = {
  style?: ViewStyle;
  reminder: IActivity;
  onPress?: () => void;
};

export const ActivityListItem = ({
  style,
  reminder,
  onPress,
}: ActivityListItemProps) => {
  const {note, message, created_at} = reminder;
  return (
    <Touchable onPress={onPress ? onPress : undefined}>
      <View
        style={applyStyles(
          'px-16 py-8 flex-row items-center justify-between',
          {
            borderBottomWidth: 1.2,
            borderBottomColor: colors['gray-20'],
          },
          style,
        )}>
        <View style={applyStyles('flex-row', {width: '66%'})}>
          <Icon
            name="bell"
            size={16}
            type="feathericons"
            color={colors.secondary}
            style={applyStyles('text-700 pt-4')}
          />
          <View style={applyStyles('pl-8')}>
            <Text style={applyStyles('text-gray-300 text-400 text-base')}>
              {message}
            </Text>
            {!!note && (
              <Text style={applyStyles('text-gray-100 text-base pt-4')}>
                {note}
              </Text>
            )}
          </View>
        </View>
        <View style={applyStyles('items-end', {width: '30%'})}>
          <Text
            style={applyStyles(
              'text-400 text-uppercase text-xxs text-gray-100',
            )}>
            {created_at &&
              formatDistanceToNowStrict(created_at, {
                addSuffix: true,
              })}
          </Text>
        </View>
      </View>
    </Touchable>
  );
};
