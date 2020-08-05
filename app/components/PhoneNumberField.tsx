import isEmpty from 'lodash/isEmpty';
import React from 'react';
import {StyleSheet, TextInput, TextInputProperties, View} from 'react-native';
import CountryPicker, {Country} from 'react-native-country-picker-modal';
import {applyStyles} from '../helpers/utils';
import {colors} from '../styles';
import Icon from './Icon';

export type PhoneNumber = {
  code: string;
  number: string;
};

type Props = {
  value: string;
  countryCode: string | null;
  onChangeText(number: PhoneNumber): void;
} & Omit<TextInputProperties, 'onChangeText'>;

export const PhoneNumberField = (props: Props) => {
  const {value, countryCode, onChangeText, ...rest} = props;
  const [phoneNumber, setPhoneNumber] = React.useState(value || '');
  const [callingCode, setCallingCode] = React.useState(countryCode || '234');
  const [country, setCountry] = React.useState<Country>({} as Country);

  const onSelect = (selectCountry: Country) => {
    const selectCountryCode = selectCountry.callingCode[0];
    setCallingCode(selectCountryCode);
    setCountry(selectCountry);
    onChangeText({code: selectCountryCode, number: phoneNumber});
  };

  const onInputChangeText = (numberInput: string) => {
    setPhoneNumber(numberInput);
    onChangeText({code: callingCode, number: numberInput});
  };

  const pickerStyles = isEmpty(country) ? {top: 6} : {top: 3};

  return (
    <View style={styles.container}>
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
          countryCode={country.cca2}
          containerButtonStyle={styles.pickerButton}
        />
        <Icon
          size={16}
          type="feathericons"
          name="chevron-down"
          color={colors['gray-50']}
          style={styles.arrowDownIcon}
        />
      </View>
      <TextInput
        value={phoneNumber}
        autoCompleteType="tel"
        keyboardType="phone-pad"
        style={styles.inputField}
        placeholder="Phone Number"
        placeholderTextColor={colors['gray-50']}
        onChangeText={(text) => onInputChangeText(text)}
        {...rest}
      />
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
    fontSize: 18,
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
