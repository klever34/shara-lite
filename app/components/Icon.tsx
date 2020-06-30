import React, {memo} from 'react';

type IconProps = {
  type: 'ionicons';
  [key: string]: any;
};

const Icon = ({type, ...props}: IconProps) => {
  if (type === 'ionicons') {
    const {default: Ionicons} = require('react-native-vector-icons/Ionicons');
    return <Ionicons {...props} />;
  }
  return null;
};

export default memo(Icon);
