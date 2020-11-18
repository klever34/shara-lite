import {Location} from 'app-v2/services/geolocation/service';

export const convertToLocationString = (location: Location): string => {
  return `${location.latitude},${location.longitude}`;
};

export const parseLocationString = (locationString: string): string[] => {
  if (!locationString) {
    locationString = ',';
  }
  const [latitude, longitude] = locationString.split(',');
  return [latitude, longitude];
};
