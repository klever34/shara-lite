import React, {useEffect, useMemo, useState} from 'react';
import TextInput, {TextInputProps} from '@/components/TextInput';
import {View} from 'react-native';

type FormFieldProps = {
  text: TextInputProps;
};

export type FormField<K extends keyof FormFieldProps = keyof FormFieldProps> = {
  type: K;
  props: FormFieldProps[K];
};

export type FormFields = {
  [name: string]: FormField;
};

type FormBuilderProps<fields extends FormFields = FormFields> = {
  fields: fields;
  onInputChange: (values: {[name: string]: string}) => void;
};

export const FormBuilder = ({fields, onInputChange}: FormBuilderProps) => {
  const names = useMemo(() => {
    return Object.keys(fields);
  }, [fields]);
  const [values, setValues] = useState(
    names.reduce((acc, name) => {
      const {
        props: {initialValue},
      } = fields[name];
      return {
        ...acc,
        [name]: initialValue ?? '',
      };
    }, {}),
  );
  useEffect(() => {
    onInputChange(values);
  }, [onInputChange, values]);
  return (
    <View>
      {names.map((name) => {
        const {type, props} = fields[name];
        switch (type) {
          case 'text':
            return (
              <TextInput
                {...props}
                onChangeText={(value) => {
                  setValues((prevValues) => ({...prevValues, [name]: value}));
                }}
              />
            );
          default:
            return null;
        }
      })}
    </View>
  );
};
