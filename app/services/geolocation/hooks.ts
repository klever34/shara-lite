import {useEffect, useMemo, useState} from 'react';
import {getGeolocationService} from '@/services';
import {Location} from '@/services/geolocation';

export const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  useEffect(() => {
    setLoading(true);
    getGeolocationService()
      .getCurrentPosition()
      .then((location) => {
        setCurrentLocation(location);
        setLoading(false);
      });
  }, []);
  return useMemo(() => ({loading, location: currentLocation}), [
    currentLocation,
    loading,
  ]);
};
