import {Button, ButtonProps} from '@/components/Button';
import {PasswordField} from '@/components/PasswordField';
import {
  PhoneNumberField,
  PhoneNumberFieldProps,
} from '@/components/PhoneNumberField';
import TextInput, {TextInputProps} from '@/components/TextInput';
import {useAsync} from '@/services/api';
import {applyStyles} from '@/styles';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  createRef,
  RefObject,
} from 'react';
import {View, TextInput as RNTextInput} from 'react-native';
import {AppInputProps} from './AppInput';
import {ImageInput, ImageInputProps} from './ImageInput';
import {RadioInput, RadioInputProps} from './RadioInput';
import {usePage} from '@/components/Page';

type FormFieldProps = {
  text: AppInputProps;
  mobile: PhoneNumberFieldProps;
  password: AppInputProps;
  image: ImageInputProps;
  radio: RadioInputProps;
};

const fieldsWithFocus: (keyof FormFieldProps)[] = [
  'text',
  'mobile',
  'password',
];

export type FormValidation = (
  name: string,
  values: {[name: string]: any},
) => string | null;

export const required: (message?: string) => FormValidation = (
  message = 'This is a required field',
) => (name, values) => {
  return values[name] ? null : message;
};

export type FormField<K extends keyof FormFieldProps = keyof FormFieldProps> = {
  type: K;
  props: FormFieldProps[K];
  validations?: FormValidation[];
  remove?: boolean;
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

export const FormBuilder = <FieldName extends keyof any>({
  fields,
  onInputChange,
  submitBtn,
  onSubmit,
}: FormBuilderProps<FieldName>) => {
  const {setFooter} = usePage();

  const names = useMemo<FieldName[]>(() => {
    return Object.keys(fields).filter(
      (name) => !fields[name as FieldName].remove,
    ) as FieldName[];
  }, [fields]);
  type FormErrors = {[name: string]: string};
  type FormValues = Record<FieldName, any>;
  type FormFieldRefs = Partial<Record<FieldName, RefObject<RNTextInput>>>;
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

  const [errors, setErrors] = useState<FormErrors>(() => {
    return names.reduce((acc, name) => {
      return {
        ...acc,
        [name]: '',
      };
    }, {} as FormErrors);
  });

  const validateForm = useCallback(() => {
    const nextErrors: FormErrors = (Object.keys(values) as FieldName[]).reduce(
      (acc, name) => {
        const validations: FormValidation[] | undefined =
          fields[name].validations;
        return {
          ...acc,
          [name]:
            validations?.reduce((error, validation) => {
              if (error) {
                return error;
              }
              return validation(name as string, values) ?? '';
            }, '') ?? '',
        };
      },
      {},
    );
    setErrors(nextErrors);
    return Object.keys(nextErrors).reduce((acc, name) => {
      return acc && !nextErrors[name];
    }, true);
  }, [fields, values]);

  const handleSubmit = useCallback(
    (submitFn?: (values: FormValues) => Promise<void>) => {
      return () => {
        if (!validateForm()) {
          return Promise.resolve();
        }
        return submitFn?.(values) ?? Promise.resolve();
      };
    },
    [validateForm, values],
  );

  const handleSubmitBtnPress = useCallback(handleSubmit(onSubmit), [
    onSubmit,
    values,
  ]);

  const {loading, run: runHandleSubmitBtnPress} = useAsync(
    handleSubmitBtnPress,
    {
      defer: true,
    },
  );

  const [fieldRefNames, fieldRefs] = useMemo(() => {
    const nextFieldRefs: FormFieldRefs = {};
    const nextFieldRefNames = names.filter((name) => {
      const field = fields[name];
      return (
        fieldsWithFocus.includes(field.type) &&
        (field.props as TextInputProps).focusable !== false
      );
    });
    nextFieldRefNames.forEach((name) => {
      nextFieldRefs[name] = createRef<RNTextInput>();
    });
    return [nextFieldRefNames, nextFieldRefs];
  }, [fields, names]);

  const getReturnKeyType = useCallback(
    (name: string) => {
      const index = fieldRefNames.findIndex((currName) => name === currName);
      return index === fieldRefNames.length - 1 ? 'done' : 'next';
    },
    [fieldRefNames],
  );

  const getSubmitEditingHandler = useCallback(
    (name: string) => {
      const index = fieldRefNames.findIndex((currName) => name === currName);
      if (index !== fieldRefNames.length - 1) {
        const nextFieldRef = fieldRefs[fieldRefNames[index + 1]];
        return () => {
          setImmediate(() => {
            if (nextFieldRef?.current) {
              nextFieldRef.current.focus();
            }
          });
        };
      } else if (index === names.length - 1) {
        return runHandleSubmitBtnPress;
      }
    },
    [fieldRefNames, fieldRefs, names.length, runHandleSubmitBtnPress],
  );

  useEffect(() => {
    onInputChange?.(values);
  }, [onInputChange, values]);

  const onChangeValue = useCallback(
    (name) => (value: any) => {
      setValues((prevValues) => ({...prevValues, [name]: value}));
    },
    [],
  );

  const button = useMemo(
    () => (
      <Button
        style={applyStyles('w-full')}
        {...submitBtn}
        onPress={runHandleSubmitBtnPress}
        isLoading={loading}
      />
    ),
    [loading, runHandleSubmitBtnPress, submitBtn],
  );

  useEffect(() => {
    if (submitBtn && setFooter) {
      setFooter(button);
    }
  }, [button, loading, runHandleSubmitBtnPress, setFooter, submitBtn]);

  return (
    <View style={applyStyles('flex-row flex-wrap')}>
      {names.map((name) => {
        const field = fields[name];
        let fieldProps;
        let fieldRef;
        switch (field.type) {
          case 'text':
            fieldProps = field.props as TextInputProps;
            fieldRef = fieldRefs[name];
            return (
              <TextInput
                key={name as string}
                ref={fieldRef}
                returnKeyType={getReturnKeyType(String(name))}
                onSubmitEditing={getSubmitEditingHandler(String(name))}
                {...fieldProps}
                containerStyle={applyStyles(
                  'mb-24 w-full',
                  fieldProps.containerStyle,
                )}
                onChangeText={onChangeValue(name)}
                isInvalid={!!errors[name as string]}
                errorMessage={errors[name as string]}
              />
            );
          case 'mobile':
            fieldProps = field.props as PhoneNumberFieldProps;
            fieldRef = fieldRefs[name];
            return (
              <PhoneNumberField
                ref={fieldRef}
                returnKeyType={getReturnKeyType(String(name))}
                onSubmitEditing={getSubmitEditingHandler(String(name))}
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
            fieldRef = fieldRefs[name];
            return (
              <PasswordField
                ref={fieldRef}
                returnKeyType={getReturnKeyType(String(name))}
                onSubmitEditing={getSubmitEditingHandler(String(name))}
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
          case 'radio':
            fieldProps = field.props as RadioInputProps;
            return (
              <RadioInput
                key={name as string}
                {...fieldProps}
                containerStyle={applyStyles(
                  'mb-24 w-full',
                  fieldProps.containerStyle,
                )}
                onChange={onChangeValue(name)}
              />
            );
          default:
            return null;
        }
      })}
      {submitBtn && !setFooter && button}
    </View>
  );
};
