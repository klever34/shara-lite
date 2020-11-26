import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import {getApiService, getIPGeolocationService} from 'app-v2/services';
import {IPGeolocationResponse} from 'types-v2/app';

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

  const fetchCountryCode = useCallback(async () => {
    try {
      const response: IPGeolocationResponse = await apiService.getUserIPDetails();
      getIPGeolocationService().setUserIpDetails(response);
      setCountryCode2(response.country_code2);
      setCallingCode(response.calling_code.replace('+', ''));
    } catch (e) {}
  }, [apiService]);

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
