import React from 'react';
import {StyleSheet, TextInput, TextInputProperties, View} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';

export type PhoneNumber = {
  code: string;
  number: string;
};

type Props = {
  value: string;
  countryCode: string | null;
  onChangeText(number: PhoneNumber): void;
} & TextInputProperties;

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
          withFlagButton={false}
        />
      </View>
      <TextInput
        value={phoneNumber}
        autoCompleteType="tel"
        keyboardType="phone-pad"
        style={styles.inputField}
        placeholder="Phone number"
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
    height: 40,
    fontSize: 16,
    width: '100%',
    borderColor: 'gray',
    borderBottomWidth: 1,
  },
  picker: {
    paddingRight: 12,
  },
});
