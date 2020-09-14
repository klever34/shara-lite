import React, {useCallback, useEffect, useMemo, useState} from 'react';
import TextInput, {TextInputProps} from '@/components/TextInput';
import {View} from 'react-native';
import {Button, ButtonProps} from '@/components/Button';
import {useAsync} from '@/services/api';

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
  onInputChange?: (values: {[name: string]: string}) => void;
  submitBtn?: ButtonProps;
  onSubmit?: (values: {[name: string]: string}) => Promise<any>;
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
    onInputChange?.(values);
  }, [onInputChange, values]);
  const _onSubmitBtnPress = useCallback(
    () => onSubmit?.(values) ?? Promise.resolve(),
    [onSubmit, values],
  );
  const {loading, run: onSubmitBtnPress} = useAsync(_onSubmitBtnPress);
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
      {submitBtn && (
        <Button {...submitBtn} onPress={onSubmitBtnPress} isLoading={loading} />
      )}
    </View>
  );
};
