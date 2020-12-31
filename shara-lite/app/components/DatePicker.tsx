import DateTimePicker, {
  AndroidEvent,
  AndroidNativeProps,
} from '@react-native-community/datetimepicker';
import React, {ReactNode, useCallback, useState} from 'react';
import {View, ViewStyle} from 'react-native';

type Props = AndroidNativeProps & {
  children(handleShow: () => void): ReactNode;
  containerStyle?: ViewStyle;
};

export const DatePicker = (props: Props) => {
  const {children, onChange, style, containerStyle, ...rest} = props;
  const [show, setShow] = useState(false);

  const handleShow = useCallback(() => {
    setShow(true);
  }, []);

  const handleChange = useCallback(
    (e: AndroidEvent, date?: Date) => {
      setShow(false);
      onChange && onChange(e, date);
    },
    [onChange],
  );

  return (
    <View style={containerStyle}>
      {children(handleShow)}
      {show && (
        <DateTimePicker style={style} onChange={handleChange} {...rest} />
      )}
    </View>
  );
};
