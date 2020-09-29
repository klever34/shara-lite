import {applyStyles} from '@/helpers/utils';
import {useFormik} from 'formik';
import React from 'react';
import {View} from 'react-native';
import {User} from 'types/app';
import {Button} from '../Button';
import {FloatingLabelInput} from '../FloatingLabelInput';

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
          inputStyle={applyStyles({
            fontSize: 18,
            width: '100%',
          })}
          onChangeText={handleChange('email')}
        />
      </View>
      <View style={applyStyles({paddingBottom: 18})}>
        <FloatingLabelInput
          editable={false}
          label="Phone Number"
          value={`${values.mobile}`}
          inputStyle={applyStyles({
            fontSize: 18,
            width: '100%',
          })}
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
