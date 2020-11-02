import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {applyStyles, colors} from '@/styles';
import {isEmpty} from 'lodash';
import React, {ReactNode} from 'react';
import {View} from 'react-native';
import CountryPicker, {Country} from 'react-native-country-picker-modal';
import {FlagButtonProps} from 'react-native-country-picker-modal/lib/FlagButton';
import {AppInput, AppInputProps} from './AppInput';

export type PhoneNumber = {
  code: string;
  number: string;
};

export type PhoneNumberFieldProps = {
  value?: PhoneNumber;
  onChangeText?(number: PhoneNumber): void;
  renderFlagButton?(props: FlagButtonProps): ReactNode;
} & Omit<AppInputProps, 'value' | 'onChangeText'>;

export const PhoneNumberField = (props: PhoneNumberFieldProps) => {
  const {value, style, onChangeText, renderFlagButton, ...rest} = props;
  const {countryCode2} = useIPGeolocation();
  const [phoneNumber, setPhoneNumber] = React.useState(
    value ?? {number: '', code: '234'},
  );
  const [country, setCountry] = React.useState<Country>({} as Country);

  const onSelect = (selectCountry: Country) => {
    const selectCountryCode = selectCountry.callingCode[0];
    setPhoneNumber((prevPhoneNumber) => {
      const nextPhoneNumber = {
        ...prevPhoneNumber,
        code: selectCountryCode,
      };
      onChangeText?.(nextPhoneNumber);
      return nextPhoneNumber;
    });
    setCountry(selectCountry);
  };

  const onInputChangeText = (numberInput: string) => {
    setPhoneNumber((prevPhoneNumber) => {
      const nextPhoneNumber = {
        ...prevPhoneNumber,
        number: numberInput,
      };
      onChangeText?.(nextPhoneNumber);
      return nextPhoneNumber;
    });
  };

  const pickerStyles = isEmpty(country) ? {top: 0} : {top: -3};

  return (
    <AppInput
      rightIcon="phone"
      autoCompleteType="tel"
      keyboardType="phone-pad"
      placeholder="Phone Number"
      value={phoneNumber.number}
      style={applyStyles('pl-96', style)}
      placeholderTextColor={colors['gray-50']}
      onChangeText={(text) => onInputChangeText(text)}
      leftIcon={
        <View style={applyStyles('mb-0 pb-0', pickerStyles)}>
          <CountryPicker
            withModal
            withEmoji
            withFilter
            withCallingCode
            withFlag={false}
            onSelect={onSelect}
            withCallingCodeButton
            // @ts-ignore
            placeholder="Country"
            renderFlagButton={renderFlagButton}
            countryCode={country.cca2 || countryCode2}
            preferredCountries={['NG', 'KE', 'ZA', 'ZW']}
            containerButtonStyle={applyStyles('w-full text-500')}
          />
        </View>
      }
      {...rest}
    />
  );
};
