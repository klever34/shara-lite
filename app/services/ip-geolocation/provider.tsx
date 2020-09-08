import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import {getApiService} from '@/services';
import {IPGeolocationResponse} from 'types/app';

type IPGeolocationObject = {
  countryCode2: string;
  callingCode: string;
};

const defaultValue = {
  countryCode2: '',
  callingCode: '',
};

export const IPGeolocationContext = createContext<IPGeolocationObject>(
  defaultValue,
);

export const useIPGeolocation = (): IPGeolocationObject => {
  return useContext(IPGeolocationContext);
};

const IPGeolocationProvider = (props: any) => {
  const [countryCode2, setCountryCode2] = useState<string>('');
  const [callingCode, setCallingCode] = useState<string>('');
  const apiService = getApiService();

  const fetchCountryCode = useCallback(
    async () => {
      try {
        const response: IPGeolocationResponse = await apiService.getUserIPDetails();
        setCountryCode2(response.country_code2);
        setCallingCode(response.calling_code.replace('+', ''));
      } catch (e) {}
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiService],
  );

  useEffect(() => {
    fetchCountryCode();
  }, [fetchCountryCode]);

  return (
    <IPGeolocationContext.Provider value={{callingCode, countryCode2}}>
      {props.children}
    </IPGeolocationContext.Provider>
  );
};

export default IPGeolocationProvider;
