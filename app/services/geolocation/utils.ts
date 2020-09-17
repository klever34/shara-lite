import {Location} from '@/services/geolocation/service';

export const convertToLocationString = (location: Location): string => {
  return `${location.latitude},${location.longitude}`;
};
