import {useIPGeolocation} from 'app-v3/services/ip-geolocation/provider';
import {colors} from 'app-v3/styles';
import isEmpty from 'lodash/isEmpty';
import React, {ReactNode} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import CountryPicker, {Country} from 'react-native-country-picker-modal';
import {FlagButtonProps} from 'react-native-country-picker-modal/lib/FlagButton';
import {FloatingLabelInputProps} from './FloatingLabelInput';
import Icon from './Icon';
import {applyStyles} from 'app-v3/styles';

export type PhoneNumber = {
  code: string;
  number: string;
};

export type PhoneNumberFieldProps = {
  editable?: boolean;
  value?: PhoneNumber;
  containerStyle?: ViewStyle;
  onChangeText?(number: PhoneNumber): void;
  isInvalid?: FloatingLabelInputProps['isInvalid'];
  renderFlagButton?(props: FlagButtonProps): ReactNode;
  errorMessage?: FloatingLabelInputProps['errorMessage'];
} & Omit<TextInputProps, 'onChangeText' | 'value'>;

export const PhoneNumberField = (props: PhoneNumberFieldProps) => {
  const {
    value,
    isInvalid,
    onChangeText,
    errorMessage,
    containerStyle,
    renderFlagButton,
    ...rest
  } = props;
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

  const pickerStyles = isEmpty(country) ? {top: 6} : {top: 3};
  const inputContainerStyle = isInvalid ? {top: 14.5} : {top: 3.5};

  return (
    <View style={applyStyles(styles.container, containerStyle)}>
      <View style={applyStyles(styles.picker, pickerStyles)}>
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
          containerButtonStyle={styles.pickerButton}
          preferredCountries={['NG', 'KE', 'ZA', 'ZW']}
        />
        {!renderFlagButton && (
          <Icon
            size={16}
            type="feathericons"
            name="chevron-down"
            color={colors['gray-50']}
            style={styles.arrowDownIcon}
          />
        )}
      </View>
      <View style={applyStyles('flex-1', inputContainerStyle)}>
        <TextInput
          value={phoneNumber.number}
          autoCompleteType="tel"
          keyboardType="phone-pad"
          style={styles.inputField}
          placeholder="Phone Number"
          placeholderTextColor={colors['gray-50']}
          onChangeText={(text) => onInputChangeText(text)}
          {...rest}
        />
        {isInvalid && (
          <Text
            style={applyStyles('text-500 pt-xs', {
              fontSize: 14,
              color: colors['red-200'],
            })}>
            {errorMessage}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    width: '100%',
    borderBottomWidth: 1,
    fontFamily: 'Rubik-Regular',
    borderColor: colors['gray-300'],
  },
  picker: {
    marginBottom: 0,
    paddingRight: 12,
    paddingBottom: 0,
  },
  pickerButton: {
    width: 100,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: colors['gray-300'],
  },
  arrowDownIcon: {
    position: 'absolute',
    top: 8,
    right: 12,
  },
});
