import {applyStyles, colors} from '@/styles';
import React, {useState} from 'react';
import {TouchableOpacity} from 'react-native';
import Icon from '../components/Icon';
import {AppInput, AppInputProps} from './AppInput';

export const PasswordField = (props: AppInputProps) => {
  const {
    onChangeText,
    value: initialValue = '',
    placeholder = 'Password',
    ...rest
  } = props;
  const [secure, setSecure] = React.useState(true);

  const toggleSecure = () => {
    setSecure(!secure);
  };
  const [value, setValue] = useState(initialValue);

  return (
    <AppInput
      value={value}
      label={placeholder}
      autoCapitalize="none"
      secureTextEntry={secure}
      placeholder="**************"
      placeholderTextColor={colors['gray-50']}
      onChangeText={(text) => {
        onChangeText && onChangeText(text);
        setValue(text);
      }}
      rightIcon={
        <TouchableOpacity
          style={applyStyles({
            height: 45,
          })}
          onPress={toggleSecure}>
          <Icon
            size={24}
            type="octicons"
            color="#a8a8a8"
            name={secure ? 'eye' : 'eye-closed'}
          />
        </TouchableOpacity>
      }
      {...rest}
    />
  );
};
