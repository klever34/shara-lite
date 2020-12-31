import {useEffect, useRef, useState} from 'react';
import {useAppNavigation} from '@/services/navigation';

export const useInfo = <T extends any>(getInfo: () => T) => {
  const getInfoRef = useRef(getInfo);
  const [info, setInfo] = useState(getInfo());
  const navigation = useAppNavigation();
  useEffect(() => {
    return navigation.addListener('focus', () => {
      setInfo(getInfoRef.current());
    });
  }, [navigation]);
  return info;
};
