import {Button, ButtonProps} from '@/components/Button';
import {PasswordField} from '@/components/PasswordField';
import {
  PhoneNumberField,
  PhoneNumberFieldProps,
} from '@/components/PhoneNumberField';
import TextInput, {TextInputProps} from '@/components/TextInput';
import {useAsync} from '@/services/api';
import {applyStyles} from '@/styles';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {AppInputProps} from './AppInput';
import {ImageInput, ImageInputProps} from './ImageInput';

type FormFieldProps = {
  text: AppInputProps;
  mobile: PhoneNumberFieldProps;
  password: AppInputProps;
  image: ImageInputProps;
};

export type FormField<K extends keyof FormFieldProps = keyof FormFieldProps> = {
  type: K;
  props: FormFieldProps[K];
  required?: boolean;
};

export type FormFields<T extends keyof any> = Record<T, FormField>;

type FormBuilderProps<
  FieldNames extends keyof any,
  Fields = FormFields<FieldNames>
> = {
  fields: Fields;
  onInputChange?: (values: {[name in keyof Fields]: any}) => void;
  submitBtn?: ButtonProps;
  onSubmit?: (values: {[name in keyof Fields]: any}) => Promise<any>;
};

export const FormBuilder = <FieldNames extends keyof any>({
  fields,
  onInputChange,
  submitBtn,
  onSubmit,
}: FormBuilderProps<FieldNames>) => {
  const names = useMemo<FieldNames[]>(() => {
    return Object.keys(fields) as FieldNames[];
  }, [fields]);
  type FormValues = Record<FieldNames, any>;
  const [values, setValues] = useState<FormValues>(
    names.reduce((acc, name) => {
      const {
        props: {value = ''},
      } = fields[name];
      return {
        ...acc,
        [name]: value,
      };
    }, {} as FormValues),
  );
  useEffect(() => {
    onInputChange?.(values);
  }, [onInputChange, values]);
  const _onSubmitBtnPress = useCallback(() => {
    const formComplete = (Object.keys(values) as FieldNames[]).reduce(
      (acc, name) => {
        return acc && (!fields[name].required || !!values[name]);
      },
      true,
    );
    if (!formComplete) {
      return Promise.resolve();
    }
    return onSubmit?.(values) ?? Promise.resolve();
  }, [fields, onSubmit, values]);
  const {loading, run: onSubmitBtnPress} = useAsync(_onSubmitBtnPress, {
    defer: true,
  });

  const onChangeValue = useCallback(
    (name) => (value: any) => {
      setValues((prevValues) => ({...prevValues, [name]: value}));
    },
    [],
  );

  return (
    <View style={applyStyles('flex-row flex-wrap')}>
      {names.map((name) => {
        const field = fields[name];
        let fieldProps;
        switch (field.type) {
          case 'text':
            fieldProps = field.props as TextInputProps;
            return (
              <TextInput
                key={name as string}
                {...fieldProps}
                containerStyle={applyStyles(
                  'mb-24 w-full',
                  fieldProps.containerStyle,
                )}
                onChangeText={onChangeValue(name)}
              />
            );
          case 'mobile':
            fieldProps = field.props as PhoneNumberFieldProps;
            return (
              <PhoneNumberField
                key={name as string}
                {...fieldProps}
                containerStyle={applyStyles(
                  'mb-24 w-full',
                  fieldProps.containerStyle,
                )}
                onChangeText={onChangeValue(name)}
              />
            );
          case 'password':
            fieldProps = field.props as AppInputProps;
            return (
              <PasswordField
                key={name as string}
                {...fieldProps}
                containerStyle={applyStyles(
                  'mb-24 w-full',
                  fieldProps.containerStyle,
                )}
                onChangeText={onChangeValue(name)}
              />
            );
          case 'image':
            fieldProps = field.props as ImageInputProps;
            return (
              <ImageInput
                key={name as string}
                {...fieldProps}
                containerStyle={applyStyles(
                  'mb-24 w-full',
                  fieldProps.containerStyle,
                )}
                onChangeValue={onChangeValue(name)}
              />
            );
          default:
            return null;
        }
      })}
      {submitBtn && (
        <Button
          style={applyStyles('w-full')}
          {...submitBtn}
          onPress={onSubmitBtnPress}
          isLoading={loading}
        />
      )}
    </View>
  );
};
