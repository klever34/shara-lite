import {colors} from 'app-v3/styles';
import {useFormik} from 'formik';
import React from 'react';
import {Text, View} from 'react-native';
import {User} from 'types-v3/app';
import {Button} from '../Button';
import {FloatingLabelInput} from '../FloatingLabelInput';
import {PhoneNumberField} from '../PhoneNumberField';
import {applyStyles} from 'app-v3/styles';

export type UserProfileFormPayload = Pick<
  User,
  'firstname' | 'lastname' | 'mobile' | 'email' | 'country_code'
>;

type Props = {
  initalValues?: UserProfileFormPayload;
  onSubmit(payload: UserProfileFormPayload): void;
};

export const UserProfileForm = ({onSubmit, initalValues}: Props) => {
  const {values, isSubmitting, handleChange, handleSubmit} = useFormik({
    initialValues: initalValues || {
      email: '',
      mobile: '',
      lastname: '',
      firstname: '',
      country_code: '',
    },
    onSubmit: (payload) => onSubmit(payload),
  });
  const mobileNumber = values.mobile.startsWith(values.country_code)
    ? values.mobile.replace(values.country_code, '')
    : values.mobile;

  return (
    <View>
      <View style={applyStyles({paddingBottom: 18})}>
        <FloatingLabelInput
          label="First Name"
          value={values.firstname}
          inputStyle={applyStyles({
            fontSize: 18,
            width: '100%',
          })}
          onChangeText={handleChange('firstname')}
        />
      </View>
      <View style={applyStyles({paddingBottom: 18})}>
        <FloatingLabelInput
          label="Last Name"
          value={values.lastname}
          inputStyle={applyStyles({
            fontSize: 18,
            width: '100%',
          })}
          onChangeText={handleChange('lastname')}
        />
      </View>
      <View style={applyStyles({paddingBottom: 18})}>
        <FloatingLabelInput
          label="Email (optional)"
          value={values.email}
          keyboardType="email-address"
          inputStyle={applyStyles({
            fontSize: 18,
            width: '100%',
          })}
          onChangeText={handleChange('email')}
        />
      </View>
      <View style={applyStyles({paddingBottom: 18})}>
        <Text
          style={applyStyles('text-400', {
            fontSize: 14,
            color: colors['gray-100'],
          })}>
          Phone Number
        </Text>
        <PhoneNumberField
          editable={false}
          renderFlagButton={() => (
            <View
              style={applyStyles({
                paddingBottom: 21,
                borderBottomWidth: 1,
                borderColor: colors['gray-300'],
              })}>
              <Text
                style={applyStyles('text-400', {
                  top: 8,
                  opacity: 0.3,
                  fontSize: 16,
                })}>
                +{values.country_code}
              </Text>
            </View>
          )}
          value={{number: mobileNumber, code: values.country_code}}
        />
      </View>
      <View style={applyStyles('mt-xl')}>
        <Button
          title="save"
          variantColor="red"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          style={applyStyles({marginBottom: 18})}
        />
      </View>
    </View>
  );
};
