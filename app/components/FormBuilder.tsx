import React, {useCallback, useEffect, useMemo, useState} from 'react';
import TextInput, {TextInputProps} from '@/components/TextInput';
import {View} from 'react-native';
import {Button, ButtonProps} from '@/components/Button';
import {useAsync} from '@/services/api';
import {
  PhoneNumberField,
  PhoneNumberFieldProps,
} from '@/components/PhoneNumberField';
import {
  PasswordField,
  PasswordFieldProps,
} from '@/components/PasswordField';
import {applyStyles} from '@/styles';

type FormFieldProps = {
  text: TextInputProps;
  mobile: PhoneNumberFieldProps;
  password: PasswordFieldProps;
};

export type FormField<K extends keyof FormFieldProps = keyof FormFieldProps> = {
  type: K;
  props: FormFieldProps[K];
  required?: boolean;
};

export type FormFields = {
  [name: string]: FormField;
};

type FormBuilderProps<fields extends FormFields = FormFields> = {
  fields: fields;
  onInputChange?: (values: {[name: string]: any}) => void;
  submitBtn?: ButtonProps;
  onSubmit?: (values: {[name: string]: any}) => Promise<any>;
};

export const FormBuilder = ({
  fields,
  onInputChange,
  submitBtn,
  onSubmit,
}: FormBuilderProps) => {
  const names = useMemo(() => {
    return Object.keys(fields);
  }, [fields]);
  const [values, setValues] = useState<{[name: string]: any}>(
    names.reduce((acc, name) => {
      const {
        props: {value = ''},
      } = fields[name];
      return {
        ...acc,
        [name]: value,
      };
    }, {}),
  );
  useEffect(() => {
    onInputChange?.(values);
  }, [onInputChange, values]);
  const _onSubmitBtnPress = useCallback(() => {
    const formComplete = Object.keys(values).reduce((acc, name) => {
      return acc && (!fields[name].required || !!values[name]);
    }, true);
    if (!formComplete) {
      return Promise.resolve();
    }
    return onSubmit?.(values) ?? Promise.resolve();
  }, [fields, onSubmit, values]);
  const {loading, run: onSubmitBtnPress} = useAsync(_onSubmitBtnPress, {
    defer: true,
  });
  const onChangeText = useCallback(
    (name) => (value: any) => {
      setValues((prevValues) => ({...prevValues, [name]: value}));
    },
    [],
  );
  return (
    <View>
      {names.map((name) => {
        const field = fields[name];
        let fieldProps;
        switch (field.type) {
          case 'text':
            fieldProps = field.props as TextInputProps;
            return (
              <TextInput
                {...fieldProps}
                containerStyle={applyStyles('mb-24')}
                onChangeText={onChangeText(name)}
              />
            );
          case 'mobile':
            fieldProps = field.props as PhoneNumberFieldProps;
            return (
              <PhoneNumberField
                {...fieldProps}
                containerStyle={applyStyles('mb-24')}
                onChangeText={onChangeText(name)}
              />
            );
          case 'password':
            fieldProps = field.props as PasswordFieldProps;
            return (
              <PasswordField
                {...fieldProps}
                containerStyle={applyStyles('mb-24')}
                onChangeText={onChangeText(name)}
              />
            );
          default:
            return null;
        }
      })}
      {submitBtn && (
        <Button {...submitBtn} onPress={onSubmitBtnPress} isLoading={loading} />
      )}
    </View>
  );
};
