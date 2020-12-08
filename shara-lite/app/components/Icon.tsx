import React, {memo} from 'react';

export type IconProps = {
  type:
    | 'ionicons'
    | 'octicons'
    | 'material-icons'
    | 'feathericons'
    | 'material-community-icons';
  [key: string]: any;
};

//TODO: Potential reduce bundle size by removing unused font set from app
export const Icon = ({type, ...props}: IconProps) => {
  if (type === 'ionicons') {
    const {default: Ionicons} = require('react-native-vector-icons/Ionicons');
    return <Ionicons {...props} />;
  }
  if (type === 'feathericons') {
    const {default: Feather} = require('react-native-vector-icons/Feather');
    return <Feather {...props} />;
  }
  if (type === 'octicons') {
    const {default: Octicons} = require('react-native-vector-icons/Octicons');
    return <Octicons {...props} />;
  }
  if (type === 'material-icons') {
    const {
      default: MaterialIcons,
    } = require('react-native-vector-icons/MaterialIcons');
    return <MaterialIcons {...props} />;
  }
  if (type === 'material-community-icons') {
    const {
      default: MaterialCommunityIcons,
    } = require('react-native-vector-icons/MaterialCommunityIcons');
    return <MaterialCommunityIcons {...props} />;
  }
  return null;
};

export default memo(Icon);
