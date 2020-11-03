import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {applyStyles, colors} from '@/styles';
import React, {ReactNode, useCallback} from 'react';
import {View} from 'react-native';
import CountryPicker, {
  Country,
  CountryCode,
} from 'react-native-country-picker-modal';
import {FlagButtonProps} from 'react-native-country-picker-modal/lib/FlagButton';
import {AppInput, AppInputProps} from './AppInput';
import {parsePhoneNumberFromString} from 'libphonenumber-js';

export type PhoneNumber = {
  callingCode: string;
  number: string;
};

export type PhoneNumberFieldProps = {
  value?: PhoneNumber;
  onChangeText?(number: PhoneNumber): void;
  renderFlagButton?(props: FlagButtonProps): ReactNode;
} & Omit<AppInputProps, 'value' | 'onChangeText'>;

export const PhoneNumberField = (props: PhoneNumberFieldProps) => {
  const {
    value,
    style,
    onChangeText,
    renderFlagButton,
    containerStyle,
    ...rest
  } = props;

  const {countryCode2, callingCode} = useIPGeolocation();

  const getCountryCode = useCallback(
    (phoneNumber?: PhoneNumber): CountryCode => {
      return ((phoneNumber &&
        parsePhoneNumberFromString(
          `+${phoneNumber.callingCode}${phoneNumber.number}`,
        )?.country) ??
        countryCode2) as CountryCode;
    },
    [countryCode2],
  );

  const [phoneNumber, setPhoneNumber] = React.useState<
    PhoneNumber & {countryCode: CountryCode}
  >(() => ({
    number: value?.number ?? '',
    callingCode: value?.callingCode ?? callingCode,
    countryCode: getCountryCode(value),
  }));

  const onSelect = (nextCountry: Country) => {
    const nextCallingCode = nextCountry.callingCode[0];
    const nextCountryCode = nextCountry.cca2;
    setPhoneNumber((prevPhoneNumber) => {
      let nextPhoneNumber = {
        ...prevPhoneNumber,
        callingCode: nextCallingCode,
        countryCode: nextCountryCode,
      };
      onChangeText?.(nextPhoneNumber);
      return nextPhoneNumber;
    });
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

  const pickerStyles = !countryCode2
    ? applyStyles({top: 0})
    : applyStyles({top: -3});

  return (
    <View style={applyStyles('w-full', containerStyle)}>
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
              countryCode={phoneNumber.countryCode}
              preferredCountries={['NG', 'KE', 'ZA', 'ZW']}
              containerButtonStyle={applyStyles('w-full text-500')}
            />
          </View>
        }
        {...rest}
      />
    </View>
  );
};
