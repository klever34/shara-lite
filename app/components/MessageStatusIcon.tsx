import React from 'react';
import Icon from './Icon';
import {StyleSheet} from 'react-native';
import {applyStyles} from '../helpers/utils';
import {IMessage} from '../models';
import {getAuthService} from '../services';

type MessageStatus = 'pending' | 'sent' | 'received' | 'read';

const iconNames: {[key in MessageStatus]: string} = {
  pending: 'alarm',
  sent: 'check',
  received: 'check-all',
  read: 'check-all',
};

type MessageStatusIconProps = {
  message: IMessage;
  style?: {[key: string]: any};
};

const MessageStatusIcon = ({message, style = {}}: MessageStatusIconProps) => {
  if (getAuthService().getUser()?.mobile !== message.author) {
    return null;
  }
  let status: MessageStatus;
  switch (message.timetokens.length) {
    case 1:
      status = 'sent';
      break;
    case 2:
      status = 'received';
      break;
    case 3:
      status = 'read';
      break;
    default:
      status = 'pending';
  }
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
