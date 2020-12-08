import {applyStyles, colors} from '@/styles';
import React, {useState, forwardRef} from 'react';
import {TextInput, TouchableOpacity} from 'react-native';
import Icon from '../components/Icon';
import {AppInput, AppInputProps} from './AppInput';

export const PasswordField = forwardRef<TextInput, AppInputProps>(
  (props, ref) => {
    const {
      onChangeText,
      value: initialValue = '',
      label = 'Password',
      ...rest
    } = props;
    const [secure, setSecure] = React.useState(true);

    const toggleSecure = () => {
      setSecure(!secure);
    };
    const [value, setValue] = useState(initialValue);

    return (
      <AppInput
        ref={ref}
        value={value}
        label={label}
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
  },
);
