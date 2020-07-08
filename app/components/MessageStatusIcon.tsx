import React from 'react';
import Icon from './Icon';
import {StyleSheet} from 'react-native';
import {applyStyles} from '../helpers/utils';

type MessageStatus = 'pending' | 'sent' | 'received' | 'read';

type MessageStatusIconProps = {
  status: MessageStatus;
  style?: {[key: string]: any};
};

const iconNames: {[key in MessageStatus]: string} = {
  pending: 'alarm',
  sent: 'check',
  received: 'check-all',
  read: 'check-all',
};

const MessageStatusIcon = ({status, style = {}}: MessageStatusIconProps) => {
  return (
    <Icon
      type="material-community-icons"
      name={iconNames[status]}
      style={applyStyles(styles.icon, style)}
      size={12}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    opacity: 0.5,
  },
});

export default MessageStatusIcon;
