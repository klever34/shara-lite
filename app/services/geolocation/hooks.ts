import {useCallback, useEffect, useMemo, useState} from 'react';
import {getGeolocationService} from '@/services';
import {Location} from '@/services/geolocation';

export const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const fetchCurrentLocation = useCallback(() => {
    setLoading(true);
    getGeolocationService()
      .getCurrentPosition()
      .then((location) => {
        setCurrentLocation(location);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    fetchCurrentLocation();
  }, [fetchCurrentLocation]);
  return useMemo(() => ({loading, currentLocation, fetchCurrentLocation}), [
    currentLocation,
    fetchCurrentLocation,
    loading,
  ]);
};
