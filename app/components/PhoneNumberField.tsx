import React from 'react';
import {StyleSheet, TextInput, TextInputProperties, View} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
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
  const [country, setCountry] = React.useState<any>({
    cca2: 'NG',
    currency: ['NGN'],
    callingCode: ['234'],
    region: 'Africa',
    subregion: 'Western Africa',
    flag: 'flag-ng',
    name: 'Nigeria',
  });

  const onSelect = (selectCountry: any) => {
    const selectCountryCode = selectCountry.callingCode[0];
    setCallingCode(selectCountryCode);
    setCountry(selectCountry);
    onChangeText({code: selectCountryCode, number: phoneNumber});
  };

  const onInputChangeText = (numberInput: string) => {
    setPhoneNumber(numberInput);
    onChangeText({code: callingCode, number: numberInput});
  };

  return (
    <View style={styles.container}>
      <View style={styles.picker}>
        <CountryPicker
          withModal
          withEmoji
          withFilter
          withCallingCode
          withFlag={false}
          onSelect={onSelect}
          countryCode={country.cca2}
          withCallingCodeButton
          containerButtonStyle={styles.pickerButton}
        />
        <Icon
          size={16}
          type="ionicons"
          name="ios-arrow-down"
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
    borderColor: colors['gray-200'],
  },
  picker: {
    top: 4,
    paddingRight: 12,
  },
  pickerButton: {
    width: 100,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors['gray-200'],
  },
  arrowDownIcon: {
    position: 'absolute',
    top: 8,
    right: 12,
  },
});
