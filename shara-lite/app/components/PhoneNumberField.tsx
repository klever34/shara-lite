import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {applySpacing, applyStyles, colors} from '@/styles';
import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {TextInput, View} from 'react-native';
import CountryPicker, {
  Country,
  CountryCode,
} from 'react-native-country-picker-modal';
import {FlagButtonProps} from 'react-native-country-picker-modal/lib/FlagButton';
import {AppInput, AppInputProps} from './AppInput';
import {getContactService, getI18nService} from '@/services';

export type PhoneNumber = {
  callingCode: string;
  number: string;
};

export type PhoneNumberFieldRef = {
  phoneNumber: PhoneNumber;
  setPhoneNumber: (phoneNumber: PhoneNumber) => void;
};

export type PhoneNumberFieldProps = {
  value?: PhoneNumber;
  onChangeText?(number: PhoneNumber): void;
  renderFlagButton?(props: FlagButtonProps): ReactNode;
  innerRef?: (node: PhoneNumberFieldRef) => void;
} & Omit<AppInputProps, 'value' | 'onChangeText'>;

const strings = getI18nService().strings;

export const PhoneNumberField = forwardRef<TextInput, PhoneNumberFieldProps>(
  (props, ref) => {
    const {
      value,
      style,
      onChangeText,
      renderFlagButton,
      containerStyle,
      innerRef,
      ...rest
    } = props;

    const {countryCode2, callingCode} = useIPGeolocation();

    const getCountryCode = useCallback(
      (phoneNumber?: PhoneNumber): CountryCode => {
        if (!phoneNumber) {
          return countryCode2 as CountryCode;
        }
        return (getContactService().parsePhoneNumber(
          `+${phoneNumber.callingCode} ${
            phoneNumber.number.length >= 4 ? phoneNumber.number : '1234'
          }`,
        )?.country ?? countryCode2) as CountryCode;
      },
      [countryCode2],
    );

    const [phoneNumber, setPhoneNumber] = React.useState<PhoneNumber>(() => ({
      number: value?.number ?? '',
      callingCode: value?.callingCode ?? callingCode,
    }));

    const [country, setCountry] = useState(getCountryCode(phoneNumber));

    useEffect(() => {
      if (innerRef) {
        innerRef({
          phoneNumber,
          setPhoneNumber: (nextPhoneNumber) => {
            setPhoneNumber(nextPhoneNumber);
            onChangeText?.(nextPhoneNumber);
          },
        });
      }
    }, [onChangeText, innerRef, phoneNumber]);

    const onSelect = (nextCountry: Country) => {
      const nextCallingCode = nextCountry.callingCode[0];
      setCountry(nextCountry.cca2);
      setPhoneNumber((prevPhoneNumber) => {
        let nextPhoneNumber = {
          ...prevPhoneNumber,
          callingCode: nextCallingCode,
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

    const pickerStyles = !country
      ? applyStyles({top: 0})
      : applyStyles({top: -3});

    return (
      <View style={applyStyles('w-full', containerStyle)}>
        <AppInput
          ref={ref}
          rightIcon="phone"
          autoCompleteType="tel"
          keyboardType="phone-pad"
          placeholder="Phone Number"
          value={phoneNumber.number}
          style={applyStyles({paddingLeft: applySpacing(104)}, style)}
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
                placeholder={strings('country')}
                renderFlagButton={renderFlagButton}
                countryCode={country}
                preferredCountries={['NG', 'KE', 'ZA', 'ZW']}
                containerButtonStyle={applyStyles('w-full text-500')}
                theme={{
                  fontSize: applySpacing(18),
                }}
              />
            </View>
          }
          {...rest}
        />
      </View>
    );
  },
);
