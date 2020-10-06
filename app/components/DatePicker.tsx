import DateTimePicker, {
  AndroidEvent,
  AndroidNativeProps,
} from '@react-native-community/datetimepicker';
import React, {ReactNode, useCallback, useState} from 'react';
import {View} from 'react-native';

type Props = AndroidNativeProps & {children(handleShow: () => void): ReactNode};

export const DatePicker = (props: Props) => {
  const {children, onChange, ...rest} = props;
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
    <View>
      {children(handleShow)}
      {show && <DateTimePicker onChange={handleChange} {...rest} />}
    </View>
  );
};
