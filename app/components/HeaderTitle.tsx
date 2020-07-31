import React from 'react';
import {applyStyles} from '../helpers/utils';
import {StyleSheet, Text, View} from 'react-native';
import Touchable from './Touchable';
import {noop} from 'lodash';

type HeaderTitleProps = {
  title: string;
  description?: string;
  onPress?: () => void;
};

const HeaderTitle = ({
  title,
  description = '',
  onPress = noop,
}: HeaderTitleProps) => {
  return (
    <Touchable style={applyStyles('h-full')} onPress={onPress}>
      <View style={applyStyles('flex-col flex-1 h-full')}>
        <Text style={styles.headerTitleText} numberOfLines={1}>
          {title}
        </Text>
        {!!description && (
          <Text style={styles.headerTitleDesc} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  headerTitleText: applyStyles('text-lg', {
    color: 'white',
    fontFamily: 'Rubik-Medium',
  }),
  headerTitleDesc: applyStyles('text-sm', {
    color: 'white',
    fontFamily: 'Rubik-Regular',
  }),
});

export default HeaderTitle;
