import React from 'react';
import Icon from './Icon';
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
  switch (true) {
    case !!message.read_timetoken:
      status = 'read';
      break;
    case !!message.received_timetoken:
      status = 'received';
      break;
    case !!message.sent_timetoken:
      status = 'sent';
      break;
    default:
      status = 'pending';
  }
  return (
    <Icon
      type="material-community-icons"
      name={iconNames[status]}
      style={applyStyles(style, {
        color: status === 'read' ? 'dodgerblue' : 'black',
        opacity: status === 'read' ? 1 : 0.5,
      })}
      size={12}
    />
  );
};

export default MessageStatusIcon;
